# 🚀 cPanel Deployment & Migration Guide

## Prerequisites on cPanel

1. **Node.js App Setup** in cPanel → "Setup Node.js App"
   - Node.js Version: 18.x or 20.x
   - Application Mode: Production
   - Application Root: `/home/yourusername/safariperfumes` (your app folder)
   - Application URL: your domain
   - Application Startup File: `server.js`

2. **MySQL Database** in cPanel → "MySQL Databases"
   - Database: `safariperfumes_perfume_db`
   - User: `safariperfumes`
   - Password: stored in cPanel only — **never write it in this repo**

3. **Environment Variables** in cPanel → "Setup Node.js App" → Your App → Environment Variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://safari-perfumes.com
   NEXT_PUBLIC_API_URL=
   DATABASE_URL=mysql://safariperfumes:<DB_PASSWORD>@localhost:3306/safariperfumes_perfume_db
   JWT_SECRET=<RANDOM_64_CHAR_HEX_STRING>
   ADMIN_SECRET_KEY=<RANDOM_64_CHAR_HEX_STRING>
   BLOB_READ_WRITE_TOKEN=<VERCEL_BLOB_RW_TOKEN>
   ```

> ⚠️ **Never commit real secrets to this repository.** Every value above is a
> placeholder. Set the real values only in the cPanel dashboard (production) or in
> `.env.local` (local dev — already gitignored). Generate secrets with:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 📦 Files to Upload to cPanel

Upload the entire project folder EXCEPT:
- `node_modules/` (will run `npm install` on server)
- `.next/` (will run `npm run build` on server)
- `.env.local`, `.env.production` (use cPanel env vars instead)
- `dev.db` (local SQLite)

---

## 🔧 cPanel Deployment Steps (Run via SSH)

```bash
# 1. SSH into cPanel
ssh yourusername@yourserver.com

# 2. Navigate to app directory
cd /home/yourusername/safariperfumes

# 3. Install dependencies (without postinstall to avoid prisma generate issues)
npm install --ignore-scripts

# 4. Generate Prisma Client
npx prisma generate

# 5. Apply versioned schema migrations to MySQL (creates/updates all tables)
npx prisma migrate deploy

# 6. Seed any missing data (bundles, settings, etc.)
npm run db:seed

# 7. Build for production
npm run build

# 8. Restart Node.js app in cPanel UI
# (Go to "Setup Node.js App" → Click "Restart" on your app)
```

> Note: The legacy Turso → MySQL data migration (previously steps 6–7) has already
> been completed. The one-off migration scripts (`scripts/migrate-turso-to-mysql.ts`
> and `scripts/verify-migration.ts`) have been removed; do not attempt to run them.

---

## 📦 Schema migrations (versioned, MySQL)

The schema is owned by `prisma/migrations/` and is applied with real, tracked
migrations — **not** `prisma db push`.

```bash
# One-time: record that the baseline migration is already applied on a DB
# that was created before versioning existed (avoids re-creating live tables).
npx prisma migrate resolve --applied 20260101000000_init_baseline

# Local dev: create + apply a new migration after editing schema.prisma
npm run db:migrate

# Production (cPanel): apply pending migrations — safe, idempotent
npm run db:deploy

# Inspect where a database stands
npm run db:status
```

| File | Purpose |
|------|---------|
| `prisma/migrations/20260101000000_init_baseline/migration.sql` | Full MySQL baseline (15 tables). Verified to build an empty database that matches `schema.prisma` exactly. |
| `prisma/migrations/migration_lock.toml` | Pins the datasource provider to `mysql`. |
| `prisma/apply-migration.ts` | **DEPRECATED.** Legacy ad-hoc `ALTER TABLE` script that silently swallows errors. Do not use it for production. |

> The MySQL user in cPanel needs `ALTER`, `CREATE`, `INDEX`, `DROP` and
> `REFERENCES` on the application database for `migrate deploy` to succeed.
> cPanel's "MySQL Databases" page grants all of these to the database user by
> default.

---

## ⚠️ Prisma Driver Adapter Note

Prisma 5.x ships **no MySQL driver adapter** (`@prisma/adapter-mysql` and
`@prisma/adapter-mariadb@5.x` do not exist on npm). All runtime code and maintenance
scripts (`prisma/seed.ts`, `prisma/apply-migration.ts`, all `scripts/*.ts`) use plain
`new PrismaClient()` against `DATABASE_URL` (MySQL). This is correct for cPanel.

---

## ✅ Migration Order (Respects Foreign Keys)

1. **Category** (3 rows) - No dependencies
2. **Product** (339+ rows) - Depends on Category
3. **Bundle** (4 rows) - No dependencies
4. **BundleItem** (~16 rows) - Depends on Bundle + Product
5. **User** - No dependencies
6. **Address** - Depends on User
7. **CartItem** - Depends on User
8. **WishlistItem** - Depends on User + Product
9. **Order** - Depends on User
10. **OrderItem** - Depends on Order
11. **Notification** - Depends on User
12. **Review** - Depends on Product
13. **Settings** (1 row) - No dependencies

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Products load on homepage
- [ ] Product search works
- [ ] Category filtering (Men/Women/Unisex) works
- [ ] Product detail page loads with images
- [ ] Admin can create/edit/delete products
- [ ] Cart/Wishlist/Order flows work
- [ ] User authentication works
- [ ] Admin dashboard accessible

---

## 🛠 Troubleshooting

### "Can't reach database server at localhost:3306"
- MySQL must be running on cPanel
- Check DATABASE_URL in cPanel Environment Variables
- Ensure MySQL user has all privileges on the database

### Prisma generate fails
```bash
# Clear cache and retry
rm -rf node_modules/.prisma
npx prisma generate
```

### Migration fails with foreign key errors
- Ensure tables are created first: `npx prisma migrate deploy`
- Migration order is already correct in the baseline migration

### Build fails
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📊 Expected Row Counts (from Turso)

| Table | Expected Rows |
|-------|---------------|
| Category | 3 |
| Product | 339 |
| Bundle | 4 |
| BundleItem | ~16 |
| User | varies |
| Order | varies |
| Review | varies |
| Settings | 1 |

---

## 📁 Files Modified in This Migration

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Provider: `sqlite` → `mysql` |
| `src/lib/prisma.ts` | Standard PrismaClient (no adapter) |
| `src/lib/turso.ts` | **DELETED** |
| `package.json` | Removed `@libsql/client`, `@prisma/adapter-libsql`; Added `mysql2` |
| 9 API routes | Import: `@/lib/turso` → `@/lib/prisma` |
| 2 scripts | Import: `../src/lib/turso` → `@/lib/prisma` |
| `scripts/migrate-turso-to-mysql.ts` | **DELETED** (one-time migration complete) |
| `scripts/verify-migration.ts` | **DELETED** (one-time migration complete) |

---

## 🎯 Next Steps After Deployment

1. **Test the live site** at https://safari-perfumes.com
2. **Create admin user** if needed: `npx tsx scripts/reset-admin.ts`
3. **Monitor logs** in cPanel → "Setup Node.js App" → View Logs
4. **Set up SSL** if not already done
5. **Configure backups** for MySQL database

---

**Migration Complete!** 🎉
Your data is now safely migrated from Turso to MySQL on cPanel.