SAFARI PERFUMES - cPanel server steps
======================================
Build ID: 1iOK4ipPw9j0YutmifFvW   (built 2026-11-14)

Workflow
--------
Local:  git push  ->  npm run build  ->  zip the .next folder  ->  upload
Server: git pull  ->  extract .next  ->  bash after-upload.sh  ->  restart

The uploaded .next changes ONLY the code. Aapki database, products, orders aur
public/uploads ki images ko upload chhoota bhi nahi.

Production settings (already in cPanel env vars - kuch change nahi karna)
-------------------------------------------------------------------------
DB name   : safariperfumes_perfume_db
DB user   : safariperfumes_perfume_user
DB host   : localhost:3306
NODE_ENV  : production
JWT_SECRET / ADMIN_SECRET_KEY / BLOB_READ_WRITE_TOKEN  -> cPanel env me set hain

Server steps
------------
1. cPanel > Setup Node.js App > STOP
2. File Manager: ~/safariperfumes kholein, purana build bacha lein:
      mv .next .next.bak-$(date +%Y%m%d-%H%M)
3. Zipped .next upload karein aur yahin extract karein
   (aisa na ho ke ~/safariperfumes/.next/.next ban jaye)
4. Check: ls .next/BUILD_ID   -> 1iOK4ipPw9j0YutmifFvW
5. Terminal:
      cd ~/safariperfumes
      git pull origin main
      bash after-upload.sh
6. cPanel > Setup Node.js App > RESTART
7. Site kholein + hard refresh (Ctrl+F5)

after-upload.sh kya karta hai (npm install NAHI)
------------------------------------------------
  DATABASE_URL .env se load (ya .env na ho to export karein)
  DB check: _prisma_migrations table hai ya nahi
  npx --no-install prisma generate    <- Linux client, lazmi (naye models)
  npm run db:deploy                   <- nayi tables/columns
  npx --no-install prisma migrate status
  touch tmp/restart.txt

Agar DB pehle 'db push' se bani thi (migration history nahi), script khud purani
2 migrations ko "already applied" mark karta hai - "table already exists" error
nahi aayega.

Agar "prisma: command not found"
-------------------------------
  npm install --no-save prisma@5.22.0
  bash after-upload.sh

Agar DB permission ka masla aaye
--------------------------------
phpMyAdmin me ye dono files chalayein:
  prisma/migrations/20261114000000_add_homepage_content_and_marketing/migration.sql
  prisma/migrations/20261114000001_sync_updated_at_defaults/migration.sql
phir:
  npx --no-install prisma migrate resolve --applied 20261114000000_add_homepage_content_and_marketing
  npx --no-install prisma migrate resolve --applied 20261114000001_sync_updated_at_defaults

Deploy ke baad
--------------
1. Site 200 - homepage par slider abhi nahi dikhega kyunki production DB me
   slide nahi hai; section khud hide ho jata hai.
2. /admin/login -> /admin/homepage -> Slider -> image upload + Save
   (Save karte hi homepage foran update hota hai)
3. /admin/marketing -> Pixel ID + CAPI token -> Save

Zaroori baatein
---------------
- npm run db:seed NA chalayein (production products overwrite ho sakte hain).
- node_modules upload NA karein (Windows build Linux par nahi chalta).
- Homepage 5 minute (revalidate = 300) tak purana cache dikha sakta hai; admin
  me koi bhi save usse foran refresh kar deta hai.
- Rollback: rm -rf .next && mv .next.bak-YYYYMMDD-HHMM .next
