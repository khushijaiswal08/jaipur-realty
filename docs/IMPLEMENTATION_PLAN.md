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

### Phase 8 — Admin authentication & dashboard ✅
- [x] bcrypt (cost 12) passwords, DB-backed revocable sessions (SHA-256 token hash), `__Host-` cookie in production
- [x] `proxy.ts` guard (redirect + `noindex` + `no-store`), server-side `requireAdmin` / capability matrix per role
- [x] Login rate limit, constant-time failure path, `npm run admin:create`
- [x] Dashboard: listing/lead KPIs, recent leads, leads by source, upcoming visits, most viewed

### Phase 9 — Property CRUD & lead management ✅
- [x] Property / project / locality / agent CRUD with zod validation, publish workflow and on-demand revalidation
- [x] Image uploads: format sniffing, EXIF rotation, resize ≤ 2400 px, WebP, metadata stripped; local disk or S3-compatible storage
- [x] Lead inbox (filters, search), lead detail with activity timeline, status/assignment, manual leads, CSV export
- [x] Site-visit scheduling, owner-listing review → draft property conversion, admin users, audit log

### Phase 10 — Blog & content management ✅
- [x] Blog index, categories, posts (Markdown, TOC, reading time), scheduled publishing
- [x] Admin CRUD for posts, categories, FAQs, testimonials; demo-content purge
- [x] About, contact, FAQ, legal pages (flagged for legal review); EMI, area-converter and stamp-duty tools

### Phase 11 — Technical SEO ✅
- [x] Metadata templates, canonical URLs (incl. paginated/filtered listings), explicit robots on every page
- [x] JSON-LD: Organization/RealEstateAgent, WebSite, BreadcrumbList, listings, projects, articles, FAQ
- [x] `sitemap.xml` (demo content excluded), `robots.txt`, dynamic OG images with ₹ formatting

### Phase 12 — Analytics, performance, validation, security, responsive testing ✅
- [x] GA4 / GTM / Meta Pixel / Clarity loaders (only when IDs are set), optional consent banner, `track()` + `data-track` click events, search events
- [x] First-party view beacon with 30-min de-duplication feeding "Most viewed" on the dashboard
- [x] CSP + HSTS (production https only), existing nosniff / frame / referrer / permissions headers
- [x] Stale property slugs 308 to the current slug via the ref code; real 404 status codes kept (no streamed `loading.tsx`)
- [x] Accessibility / responsive audit at 375 px and desktop: fixed page overflow from `sr-only` text in scroll containers, heading order, 404/error `h1`, invalid `<address>` nesting, admin dashboard grid overflow
- [x] `next/image` `priority` → `preload`; npm overrides clear the Prisma CLI advisories (0 vulnerabilities)
- [x] Verified the production build under the production CSP (hydration, no violations)

### Phase 13 — Production build & deployment preparation ⏳
Deployment guide, Dockerfile, launch checklist, final gates.
