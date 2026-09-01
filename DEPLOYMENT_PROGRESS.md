# Deployment Fix Progress Tracker

## LATEST SESSION CONTEXT (2026-09-02, resumed)
USER CONFIRMED: Production domain is STRICTLY https://safari-perfumes.com (WITH hyphen).
This REVERSES the earlier SITE_URL decision (which had set safariperfumes.com no-hyphen).
New 4-step workflow (domain, build, git, cPanel) in progress. See bottom of file.

### Step 1 (domain & env audit) — DONE 2026-09-02
- [x] SITE_URL + all emails + sitemap/robots fallbacks = https://safari-perfumes.com
- [x] .env & .env.production NEXT_PUBLIC_BASE_URL = https://safari-perfumes.com
- [x] CPANEL_DEPLOYMENT.md domain refs fixed (was no-hyphen on lines 20 & 175)
- [x] AGENTS.md Database section corrected: Turso (libSQL) -> MySQL/cPanel + cPanel
      DATABASE_URL mysql://safariperfumes:Hassan224266@localhost:3306/safariperfumes_perfume_db
- [x] Verified zero unhyphenated `safariperfumes.com` in src/buildable files
- [x] Verified zero TURSO/libsql in all env files and all git-tracked .ts/.tsx/.js/.json

### Step 2 (production build) — DONE 2026-09-02
- [x] `npm run build` succeeded (logged to build-output.log)
- [x] Fresh .next/standalone regenerated; NEW BUILD_ID = k8BG0UGTBl-2n7TsI8TYq
- [x] standalone bundled .env.production verified:
      NEXT_PUBLIC_BASE_URL=https://safari-perfumes.com (hyphen) +
      DATABASE_URL=mysql://safariperfumes:Hassan224266@localhost:3306/safariperfumes_perfume_db
- [x] `npm run lint` = 0 errors / 37 pre-existing warnings (test unused-vars only)

### Step 3 (git) — DONE 2026-09-02
- [x] Committed as e06231f; pushed to `origin/main`
      (https://github.com/Bilalasim367/safari-website.git) : b955f48..e06231f
- [x] NOTE: second remote `deploy` (ssh safari-perfumes.git) is STALE at 41f3da7 and
      NOT the push target. If cPanel clones from `deploy`, re-push there before Step 4.

### Step 4 (cPanel guide) — PROVIDED in chat; CPANEL_DEPLOYMENT.md already has the
manual-upload variant. Suggest adding a Git-clone variant to CPANEL_DEPLOYMENT.md next
session if cPanel uses Git Version Control.

Status legend: [ ] pending | [x] done | [~] in progress

## Task list
- [x] 1. "Install @prisma/adapter-mysql" — RESOLVED DIFFERENTLY:
      `@prisma/adapter-mysql` and `@prisma/adapter-mariadb@5.x` DO NOT EXIST in npm
      (verified: @prisma/adapter-mysql = 404; @prisma/adapter-mariadb has no 5.x line).
      Prisma 5.22 ships NO MySQL driver adapter. Proper fix: rewrite scripts to use
      plain `PrismaClient()` exactly like src/lib/prisma.ts (works with MySQL already,
      reads DATABASE_URL directly). mysql2 already installed; no adapter needed.
      DONE: rewrote 12 files (prisma/seed.ts, prisma/apply-migration.ts, and 10 scripts
      incl. reset-admin, find-admin, data-audit, verify-flags, phase1-5, backfill)
      to `import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient()`
- [ ] 2. Fix SITE_URL domain in src/lib/site.ts to https://safariperfumes.com;
      update hyphenated domain in layout.tsx / other references [IN PROGRESS]
- [x] 2. Fix SITE_URL domain in src/lib/site.ts to https://safariperfumes.com;
      update hyphenated domain in layout.tsx / other references [DONE]
      IMPORTANT: website domain = safariperfumes.com (no hyphen) -> SITE_URL
      updated. Support EMAIL stays support@safari-perfumes.com (hyphen) per user
      clarification - NOT changed. Other emails (noreply@/legal@/privacy@) use
      safariperfumes.com already. Verified: site.ts=no-hyphen, emails=hyphen.
- [x] 3. Secure diagnostic endpoints [DONE]
      - Deleted src/app/api/diagnose/route.ts AND removed empty src/app/api/diagnose dir
      - Removed /api/diagnose-raw block from server.js
      - Removed now-unused `require('mysql2/promise')` from server.js too
      - node --check server.js passes; fs/path still used by writeLog
- [x] 4. Clean up stale files [DONE]
      - Deleted deploy-app/ (was untracked build artifact; added /deploy-app/ to .gitignore)
      - Deleted scripts/migrate-turso-to-mysql.ts, scripts/verify-migration.ts (were untracked)
      - Deleted DEPLOY-STEPS.txt (was git-tracked, shown as D in git status)
      - Updated CPANEL_DEPLOYMENT.md: removed broken steps 6-7 + "Migration Scripts Created"
        + verify-migration checklist line + files-modified rows; added note that the
        migration is complete and scripts are deleted; added "Prisma Driver Adapter Note".
- [x] 5. Standardize env files [DONE]
      - .env.example: rewritten as clean MySQL-only cPanel template (DATABASE_URL
        mysql://user:pass@host:port/db, same-origin NEXT_PUBLIC_API_URL empty, no Turso)
      - .env.production: verified already clean (MySQL only, NEXT_PUBLIC_API_URL empty)
      - .env: removed commented-out TURSO token + wrong-domain commented lines (secret
        leak hazard); set NEXT_PUBLIC_API_URL empty (same-origin) for consistency.
        NOTE: .env DATABASE_URL still uses user `safariperfumes` while
        .env.production/CPANEL_DEPLOYMENT.md use `safariperfumes_perfume_user` -
        flagged, needs real cPanel creds confirmed before deploy.
      - Verified: zero TURSO/libsql/adapter-mysql/adapter-libsql refs remain repo-wide.
- [x] 6. Fresh build [DONE]
      - npm run build succeeded (prisma generate + next build, 34s compile, 389 static
        pages generated, no errors). Output logged to build-output.log.
      - Fresh .next/standalone generated: contains server.js, .next, node_modules,
        package.json, and bundled .env (cleaned production MySQL config, no Turso).
        New BUILD_ID = UTpIwsElPNfWrOD6iUwoO.
      - NOTE: next build loaded .env.local (dev MySQL mysql://root...perfume_db) for
        static page generation (Next 16 loads .env.local even in build). Build env
        files loaded: .env.local, .env.production, .env. Fine for local build; on
        cPanel the server's own env vars take precedence.
      - Remaining flag: standalone/.env uses DB user `safariperfumes` while
        .env.production/CPANEL_DEPLOYMENT.md use `safariperfumes_perfume_user`.
        MUST confirm the real cPanel MySQL credentials before go-live.

## Final state (domain RE-CONFIRMED 2026-09-02)
Production domain is STRICTLY https://safari-perfumes.com (WITH hyphen).
All src/env/docs now use safari-perfumes.com (SITE_URL, emails, sitemap/robots fallbacks).
Deploy blocker fixes:
1. Prisma adapter: resolved (no adapter exists for Prisma 5.22; rewrote 12 scripts to
   plain PrismaClient against DATABASE_URL).
2. Domain: SITE_URL + all emails = safari-perfumes.com (with hyphen).
3. Diagnostics: /api/diagnose route deleted + /api/diagnose-raw removed from server.js.
4. Cleanup: deploy-app/, migrate-turso-to-mysql.ts, verify-migration.ts, DEPLOY-STEPS.txt
   deleted; CPANEL_DEPLOYMENT.md updated; /deploy-app/ added to .gitignore.
5. Env: .env.example rewritten MySQL-only; .env cleaned (Turso token + wrong-domain
   comments removed, same-origin API URL); .env.production aligns to
   mysql://safariperfumes:Hassan224266@localhost:3306/safariperfumes_perfume_db.
6. Build: fresh .next/standalone generated successfully.

## Untracked helper files created during this work
- DEPLOYMENT_PROGRESS.md (this tracker)
- build-output.log (npm run build log)
(Both are safe; build-output.log can be deleted later.)

## OPEN ITEM (RESOLVED 2026-09-02)
- DB credentials confirmed by user: user `safariperfumes`, password `Hassan224266`,
  db `safariperfumes_perfume_db` (matches .env and standalone bundle).
  - Updated .env.production DATABASE_URL to the confirmed creds.
  - Updated CPANEL_DEPLOYMENT.md MySQL user + env var block to the confirmed creds.
  - Verified: no remaining `safariperfumes_perfume_user` / old password anywhere in
    config/docs (only in this tracker's history log).

## Go-live ready checklist
- [x] Prisma scripts use plain PrismaClient (no adapter)
- [x] SITE_URL = safariperfumes.com; support email stays safari-perfumes.com
- [x] Diagnostics endpoints removed
- [x] Stale/obsolete files deleted
- [x] Env files standardized (MySQL only, same-origin API URL)
- [x] Fresh .next/standalone built (BUILD_ID UTpIwsElPNfWrOD6iUwoO; REBUILT after
       credential alignment -> NEW BUILD_ID lBII44tmDzQeODHSukbIx; both standalone
       .env and .env.production now carry mysql://safariperfumes:Hassan224266@...)
- [x] DB credentials aligned everywhere

## Log
(append entries here as tasks complete)
