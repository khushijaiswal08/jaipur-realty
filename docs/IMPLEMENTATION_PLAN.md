# Implementation Plan

Phase-by-phase plan and delivery log. Scope per phase follows SPEC §61. Every phase ends with the
quality gates in SPEC §59: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and a
check of the pages the phase touched.

Status legend: ✅ done · 🔄 in progress · ⏳ not started

## Architecture at a glance

```
Browser ──► Next.js App Router (app/)
              ├─ (site)/…        public pages — Server Components, ISR where possible
              ├─ admin/…         admin panel — dynamic, session-guarded
              ├─ api/…, media/…  route handlers (uploads, media serving, tracking)
              └─ lib/actions/…   Server Actions (forms) → zod validation
                        │
                        ▼
              services/*  (only layer that talks to Prisma; maps BigInt → number)
                        │
                        ▼
              lib/db.ts → Prisma 7 client (generated/prisma) → @prisma/adapter-pg → PostgreSQL

Cross-cutting: lib/config (the only env reader for business identity) · lib/format (₹ Lakh/Cr,
sq ft/sq yd, phone, IST dates) · lib/whatsapp · lib/seo · lib/analytics · lib/auth
```

**Key conventions**
- Components never import Prisma. Pages call `services/*`.
- Business identity comes only from `siteConfig` (`lib/config`).
- Money = whole rupees; area = sq ft; dates = UTC stored, IST displayed.
- Demo rows carry `isDemo`, show a badge and are `noindex`.

## Phases

### Phase 0 — Project initialisation & architecture ✅
- [x] Toolchain installed (Node 24 LTS, PostgreSQL 17, Git) and local database created
- [x] Next.js 16 + TypeScript strict (+ `noUncheckedIndexedAccess`) + Tailwind 4 + ESLint
- [x] Prisma 7 config, schema for all SPEC §10–13, §28, §42 entities, enums and indexes; initial migration + `property_ref_seq`
- [x] `lib/config` (site config + zod validation at build/dev start + server config)
- [x] `lib/format` (price, area, phone, date, labels), `lib/whatsapp`, `lib/constants`
- [x] Idempotent seed: 12 localities, 23 amenities, 5 projects, 20 properties, 97 images, agent, testimonials, blog, FAQs
- [x] Placeholder SVG generator (17 images)
- [x] `.env.example`, `docker-compose.yml`, `instrumentation.ts`
- [x] Unit tests for formatters and WhatsApp builders (78 passing)
- [x] Docs: SPEC, ASSUMPTIONS, IMPLEMENTATION_PLAN
- [x] Gates: lint ✔ typecheck ✔ tests ✔ build ✔

### Phase 1 — Design system, layout, navbar, footer, homepage ⏳
Tokens and fonts; `components/ui` primitives; header with mobile menu; footer; floating
WhatsApp button and mobile contact bar; home page sections (hero search, featured properties,
new projects, localities, why us, testimonials, blog, post-property CTA, contact strip).

### Phase 2 — Property data models & seed data ⏳
Services layer (`property`, `project`, `locality`, `content`) with serialisable DTOs; verify
seed coverage; demo badges wired to `isDemo`.

### Phase 3 — Property search & filters ⏳
`/buy`, `/rent` with URL-driven filters, sort and pagination; filter drawer on mobile; empty
state; shortlist and compare (localStorage).

### Phase 4 — Property detail pages ⏳
Gallery and lightbox, key facts, price block, amenities, map, agent card, similar properties,
sold/rented banners, sticky CTAs, `noindex` for demo.

### Phase 5 — Locality & SEO landing pages ⏳
`/localities`, `/localities/[slug]`, `/buy/[locality]`, `/rent/[locality]`.

### Phase 6 — Project detail pages ⏳
`/projects`, `/projects/[slug]` with configurations table, price range, brochure CTA.

### Phase 7 — Lead generation ⏳
Enquiry, callback, brochure, site-visit and owner-listing forms (Server Actions + zod),
honeypot, timing check, rate limiting, dedupe, email notifications, UTM capture, WhatsApp and
call tracking.

### Phase 8 — Admin authentication & dashboard ⏳
Login, sessions, proxy guard, roles, `admin:create` script, dashboard KPIs.

### Phase 9 — Property CRUD & lead management ⏳
Property/project CRUD, image uploads (local/S3), lead inbox, lead detail with activity
timeline, site visits, owner-listing review, CSV export, audit log.

### Phase 10 — Blog & content management ⏳
Blog pages; admin CRUD for posts, categories, FAQs, testimonials; about, contact, FAQ and
legal pages; tools (EMI, area converter, stamp duty).

### Phase 11 — Technical SEO ⏳
Metadata templates, canonical URLs, JSON-LD, sitemap, robots, OG images.

### Phase 12 — Analytics, performance, validation, security, responsive testing ⏳
GA4/GTM/Pixel/Clarity loaders and events, consent banner, view tracking, CSP and headers,
accessibility pass, mobile checks.

### Phase 13 — Production build & deployment preparation ⏳
Deployment guide, Dockerfile, launch checklist, final gates.
