# AGENTS.md

## Project Overview
- **Name**: Safari Perfumes E-commerce
- **Stack**: Next.js 16.2.4 (beta), React 19.2.4, Prisma 5.22.0, Tailwind 3.4, Sass 1.99
- **Router**: App Router with `src/app` directory

## Critical Quirks

### Next.js 16 Breaking Changes
This is **not** the Next.js you know. Version 16.2.4 has breaking changes to APIs, conventions, and file structure. Before writing any code, read the relevant guides in `node_modules/next/dist/docs/`. Heed all deprecation notices.

### React Compiler Enabled
The project has `reactCompiler: true` in `next.config.ts`. This is experimental and affects React rendering behavior. Be aware of compiler-specific constraints when using hooks or state.

## Commands
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
npm run db:seed # Seed database (requires .env with DATABASE_URL)
```

## Run Order
Run `npm run lint` before making commits. There is no separate typecheck - ESLint handles linting.

## Architecture
- **App Router**: `src/app/` - all pages and layouts
- **Components**: `src/components/` - React components
- **Contexts**: `src/context/` - AuthContext, CartContext, AdminContext
- **Lib**: `src/lib/` - utilities, models, API client, validation
- **Data**: `src/data/products.ts` - static product catalog
- **Database**: `prisma/schema.prisma` - Prisma models

## Path Alias
Use `@/*` to import from `./src/*` (e.g., `@/components/Header`).

## Styles
- Tailwind 3.4 + Sass in dependencies
- Custom theme colors in `tailwind.config.js`: `gold`, `charcoal`
- Fonts: Playfair Display (heading), Montserrat (body), Lato (secondary)

## Database
- Prisma with PostgreSQL
- Requires `.env` with `DATABASE_URL`
- Run `npm run db:seed` to seed test data

## Entry Points
- Homepage: `src/app/page.tsx`
- Product data: `src/data/products.ts`

## SPEC Reference
Detailed UI/UX and functional specs in `SPEC.md`.

## Linting
- ESLint 9 with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/`, `build/`, `next-env.d.ts`