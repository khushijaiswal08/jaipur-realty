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

### Phase 1 — Design system, layout, navbar, footer, homepage ✅
- [x] Tokens (terracotta/ink/sand, WhatsApp green at AA contrast), Inter + Playfair Display
- [x] `components/ui` primitives; header + native-`<dialog>` mobile menu; footer from `siteConfig`
- [x] Floating WhatsApp; generated favicon from business initials; 404 + error boundaries
- [x] Home: hero search (GET form), shortcuts, featured, localities, projects, why-us, testimonials, CTA, blog, contact strip

### Phase 2 — Property data models & seed data ✅
- [x] Services with serialisable DTOs (BigInt → number): cards, property/project/locality detail, agents, amenities
- [x] Seed-coverage tests enforcing SPEC §35.2; `npm run db:purge-demo`

### Phase 3 — Property search & filters ✅
- [x] URL filter parser/serialiser (tested); search service with 14 filters and 6 sorts; denormalised `primaryAreaSqft`
- [x] `/buy`, `/rent`: auto-apply sidebar, mobile drawer, chips, pagination, empty state with suggestions
- [x] Shortlist + compare (localStorage), compare tray; explicit robots metadata helper

### Phase 4 — Property detail pages ✅
- [x] Gallery + lightbox, type-aware key facts, amenities, video facade, OSM/Google map (approximate mode)
- [x] Agent card, status/demo banners, similar properties, sticky CTAs, mobile contact bar, short links `/property/JP1001`

### Phase 5 — Locality & SEO landing pages ✅
- [x] `/localities`, `/localities/[slug]` (live stats, nearby by distance), `/buy/[locality]`, `/rent/[locality]`

### Phase 6 — Project detail pages ✅
- [x] `/projects` (filters), `/projects/[slug]` with configurations table, facts, developer, listings in project

### Phase 7 — Lead generation ✅
- [x] Server Actions + zod: enquiry, callback, brochure, contact, site visit (14-day × hourly), owner listing (4-step)
- [x] Honeypot, timing heuristic, rate limit (5/10 min), optional Turnstile, 24 h dedupe → activity, agent auto-assign
- [x] Email notifications via SMTP after the response (console fallback); first-touch UTM attribution; analytics events
- [x] Verified end-to-end in the browser (enquiry, repeat visit request, owner listing)

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
