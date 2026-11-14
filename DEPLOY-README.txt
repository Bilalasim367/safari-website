SAFARI PERFUMES - cPanel deploy bundle
======================================
Build ID: 1iOK4ipPw9j0YutmifFvW
Banaya gaya: 2026-11-14 (local production build)

Is zip me kya hai
-----------------
.next/                compiled production app (upload ka asal maqsad)
prisma/               schema.prisma + migrations (naye tables/columns ke liye)
public/               images/fonts (public/uploads is zip me NAHI hai - aapki
                      server ki uploaded images safe rahengi)
src/                  source files (runtime ke liye zaroori nahi, backup ke liye)
server.js             custom server (npm start isi ko chalata hai)
package.json etc.     config files
after-upload.sh       ek command me baqi kaam (prisma generate + migrate + restart)
.env                  sirf DATABASE_URL (Prisma CLI ke liye)
.env.example          sirf sample

IMPORTANT: is zip me aapki database ka password hai. Ise public/shared na karein.

node_modules is zip me NAHI hai - jaan-boojh kar. Wo server par pehle se maujood
hai aur Windows ka banaya hua node_modules Linux par kaam nahi karta.

Production settings (cPanel env se match)
-----------------------------------------
DB name   : safariperfumes_perfume_db
DB user   : safariperfumes_perfume_user
DB host   : localhost:3306
NODE_ENV  : production
JWT_SECRET / ADMIN_SECRET_KEY / BLOB_READ_WRITE_TOKEN cPanel ke
"Setup Node.js App" env vars me already set hain - unhe chhedne ki zaroorat nahi.
.env sirf is liye hai ke Prisma CLI terminal me DATABASE_URL parh sake
(cPanel app env vars shell me nahi aate).

Upload + extract
----------------
1. cPanel > Setup Node.js App > STOP (app band karein)
2. File Manager me ~/safariperfumes kholein, purana build bacha lein:
      mv .next .next.bak-$(date +%Y%m%d-%H%M)
3. Ye zip upload karein aur ~/safariperfumes me hi Extract karein
   (aisa na ho ke ~/safariperfumes/.next/.next ban jaye)
4. Check: ls .next/BUILD_ID   -> file maujood honi chahiye

Post-extract (terminal)
-----------------------
cd ~/safariperfumes
bash after-upload.sh

Script ye karta hai (npm install NAHI):
  mkdir -p public/uploads/homepage tmp
  DATABASE_URL .env se load
  DB check: _prisma_migrations table hai ya nahi
  npx --no-install prisma generate      <- Linux client banta hai, lazmi
  npm run db:deploy                     <- tables/columns banate hain
  npx --no-install prisma migrate status
  touch tmp/restart.txt

Agar aapki purani DB 'db push' se bani thi (migration history nahi), script khud
purani 2 migrations ko "already applied" mark karta hai aur phir nayi chalata
hai - is liye "table already exists" wala error nahi aayega.

Agar "prisma: command not found" aaye (production install me CLI na ho):
  npm install --no-save prisma@5.22.0
  bash after-upload.sh

Agar DB permission ka masla aaye (duplicate column / access denied):
  phpMyAdmin me ye dono files chalayein:
    prisma/migrations/20261114000000_add_homepage_content_and_marketing/migration.sql
    prisma/migrations/20261114000001_sync_updated_at_defaults/migration.sql
  phir:
    npx --no-install prisma migrate resolve --applied 20261114000000_add_homepage_content_and_marketing
    npx --no-install prisma migrate resolve --applied 20261114000001_sync_updated_at_defaults

Restart ke baad
---------------
1. Site kholein (200 aana chahiye). Homepage par slider abhi nahi dikhega -
   production DB me slide nahi hai, is liye section khud hide ho jata hai.
2. /admin/login -> /admin/homepage -> Slider -> image upload + Save
   (Save karte hi homepage foran update hota hai)
3. /admin/marketing -> Pixel ID + CAPI token -> Save

Zaroori baatein
---------------
- npm run db:seed NA chalayein (production products overwrite ho sakte hain).
- .env / database password kabhi git me na jaye (ye zip git-ignored hai).
- Homepage 5 minute (revalidate = 300) tak purana cache dikha sakta hai;
  admin me koi bhi save usse foran refresh kar deta hai.
- Browser me purana JS chunk cache ho sakta hai - hard refresh (Ctrl+F5) karein.
- Backup: agar kuch ghalat lage to `.next` ko wapas rename kar dein:
      rm -rf .next && mv .next.bak-YYYYMMDD-HHMM .next
