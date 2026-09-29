# Jaipur Real Estate Website

Property listings (sale & rent), builder projects, Jaipur locality guides, lead capture
(enquiries, WhatsApp, calls, site visits, owner listings) and an admin panel.

- **Spec:** [docs/SPEC.md](docs/SPEC.md)
- **Placeholders & decisions:** [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md)
- **Phase plan & progress:** [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · PostgreSQL ·
Prisma 7 · zod

## Getting started

Requirements: Node.js ≥ 20.19 and PostgreSQL ≥ 16 (native, or `docker compose up -d`).

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then edit DATABASE_URL, AUTH_SECRET and business details
npm run db:migrate          # apply migrations
npm run db:seed             # demo data (safe to re-run)
npm run admin:create        # create the first admin login
npm run dev                 # http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server / production build / production server |
| `npm run lint` · `typecheck` · `test` · `check` | Quality gates (SPEC §59) |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed demo data (idempotent) |
| `npm run db:reset` | Drop, re-migrate and re-seed (development only) |
| `npm run db:studio` | Browse the database |
| `npm run db:purge-demo` | Delete every `isDemo` record |
| `npm run admin:create` | Create an admin user interactively |
| `npm run placeholders` | Regenerate the demo SVG images |

## Where things live

```
app/          routes — (site) public pages, admin/ panel, api/ route handlers
components/   ui/ primitives, layout/, property/, project/, forms/, admin/, shared/
lib/          config/ (env → siteConfig), format/, whatsapp, constants/, seo/, auth/, actions/
services/     data access — the only layer that imports Prisma
prisma/       schema, migrations, seed + seed-data
scripts/      admin/demo/placeholder CLIs
docs/         spec, assumptions, plan
```

Business name, phone, WhatsApp, email, address, logo, map key and analytics IDs are read only from
`.env` via `lib/config` — never hardcode them elsewhere.
