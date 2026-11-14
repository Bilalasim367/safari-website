#!/usr/bin/env bash
# Safari Perfumes - post-upload steps for cPanel (no npm install needed)
set -uo pipefail

cd "$(dirname "$0")"

DBCHECK=".deploy-dbcheck.cjs"
cleanup() { rm -f "$DBCHECK"; }
trap cleanup EXIT

echo "==> App root: $(pwd)"

if [ ! -f ".next/BUILD_ID" ]; then
  echo "ERROR: .next/BUILD_ID nahi mila. Zip galat jagah extract hui hai?" >&2
  exit 1
fi
echo "==> Build ID: $(cat .next/BUILD_ID)"

# --- DATABASE_URL -----------------------------------------------------------
if [ -z "${DATABASE_URL:-}" ] && [ -f ".env" ]; then
  ENV_URL=$(grep -m1 '^DATABASE_URL=' .env | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  if [ -n "${ENV_URL:-}" ]; then
    export DATABASE_URL="$ENV_URL"
    echo "==> DATABASE_URL .env se load hua"
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL set nahi hai aur .env me bhi nahi mila." >&2
  echo "Chalayein: export DATABASE_URL='mysql://USER:PASSWORD@localhost:3306/DB_NAME'" >&2
  exit 1
fi

mkdir -p public/uploads/homepage tmp
chmod -R u+rwX public/uploads 2>/dev/null
echo "==> Upload folder ready: public/uploads/homepage"

# --- Is the DB already baselined? -------------------------------------------
cat > "$DBCHECK" <<'EOF'
const mysql = require('mysql2/promise');
const url = process.env.DATABASE_URL;
if (!url) { console.error('NO_URL'); process.exit(2); }
(async () => {
  const u = new URL(url.replace(/^mysql:\/\//, 'http://'));
  const conn = await mysql.createConnection({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.replace(/^\//, '')),
    connectTimeout: 10000,
  });
  const [mig] = await conn.query(
    "SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '_prisma_migrations'"
  );
  const [prod] = await conn.query(
    "SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'product'"
  );
  console.log(`${mig[0].c} ${prod[0].c}`);
  await conn.end();
})().catch((e) => { console.error('DBCHECK_FAILED: ' + e.message); process.exit(1); });
EOF

CHECK_OUT=$(node "$DBCHECK")
CHECK_RC=$?
if [ $CHECK_RC -ne 0 ]; then
  echo "ERROR: database se connect nahi ho saka ($CHECK_OUT)" >&2
  echo "DATABASE_URL / DB user permissions check karein." >&2
  exit 1
fi

HAS_HISTORY=${CHECK_OUT%% *}
HAS_TABLES=${CHECK_OUT##* }
echo "==> DB check: _prisma_migrations=$HAS_HISTORY, app tables=$HAS_TABLES"

if [ "$HAS_HISTORY" = "0" ] && [ "$HAS_TABLES" != "0" ]; then
  echo "==> Ye database pehle 'db push' se bana tha (migration history nahi hai)."
  echo "    Purani migrations ko 'already applied' mark kar rahe hain, phir nayi chalengi."
  npx --no-install prisma migrate resolve --applied 20260101000000_init_baseline || exit 1
  npx --no-install prisma migrate resolve --applied 20261105000000_add_product_display_order || exit 1
fi

# --- Prisma client + migrations --------------------------------------------
echo "==> Prisma client generate (Linux engines)"
npx --no-install prisma generate || exit 1

echo "==> Database migrations"
npm run db:deploy || exit 1

echo "==> Migration status"
npx --no-install prisma migrate status || true

touch tmp/restart.txt
echo "==> Restart signal bhej diya (tmp/restart.txt)"
echo ""
echo "Ab cPanel > Setup Node.js App > Restart dabayein."
