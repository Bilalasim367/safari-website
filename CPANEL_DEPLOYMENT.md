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
   - Password: `Hassan224266`

3. **Environment Variables** in cPanel → "Setup Node.js App" → Your App → Environment Variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://safari-perfumes.com
   NEXT_PUBLIC_API_URL=
   DATABASE_URL=mysql://safariperfumes:Hassan224266@localhost:3306/safariperfumes_perfume_db
   JWT_SECRET=dwmRO--RV-caZhYpfaczKAKIUFVNjTb19ejo3KCARz8dLnfnn02SUjSUpbaefKY1
   ADMIN_SECRET_KEY=RIlr2T54aedWFyxLsb_76yZTbRLpzMabnwnJkC3ud6I
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_X52lACMLpQhUxQcX_rb9KXH4c2cUfApnC65KAZHIMtT8FrZ
   ```

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

# 5. Push schema to MySQL (creates all tables)
npx prisma db push

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
- Ensure tables are created first: `npx prisma db push`
- Migration order is already correct in script

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