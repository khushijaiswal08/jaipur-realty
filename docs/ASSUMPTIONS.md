# Assumptions & Placeholders

Everything below was decided without input from the business, so it is either a **placeholder**
(must be replaced before launch) or a **default** (a sensible choice you may want to revisit).
Update this file whenever one of these is resolved.

_Last updated: 2026-09-29_

## 1. Business placeholders — replace before launch

All of these live in `.env` and are read **only** by `lib/config` (SPEC §34). Nothing else in the
codebase hardcodes them. Changing a `NEXT_PUBLIC_*` value requires a rebuild.

| What | Env var | Placeholder value | Notes |
|---|---|---|---|
| Business name | `NEXT_PUBLIC_BUSINESS_NAME` | `Demo Realty Jaipur` | Used in header, footer, titles, emails, WhatsApp messages. |
| Logo | `NEXT_PUBLIC_BUSINESS_LOGO_URL` | _(empty → text wordmark)_ | Put the file in `public/brand/` and set e.g. `/brand/logo.svg`. |
| Phone | `NEXT_PUBLIC_BUSINESS_PHONE` | `+91 90000 00000` | **Real value provided (2026-09-29)** and set in the local `.env`. Copy it to the production `.env`. |
| WhatsApp | `NEXT_PUBLIC_BUSINESS_WHATSAPP` | _(empty → uses phone)_ | **Real value provided** (same mobile as the phone). Must be a mobile number. |
| Email | `NEXT_PUBLIC_BUSINESS_EMAIL` | `hello@example.com` | **Real value provided** and set in the local `.env`; also used for `LEAD_NOTIFICATION_EMAIL`. |
| Office address | `NEXT_PUBLIC_BUSINESS_ADDRESS_LINE1/2`, `_CITY`, `_STATE`, `_PINCODE` | `Office No. 0, Demo Business Centre`, Vaishali Nagar, Jaipur 302021 | |
| Office location | `NEXT_PUBLIC_BUSINESS_LAT/LNG` | Vaishali Nagar centroid | Used for the contact-page map and LocalBusiness schema. |
| Office hours | `NEXT_PUBLIC_BUSINESS_HOURS` | `Mon–Sat 10:00–19:00` | |
| RERA agent number | `NEXT_PUBLIC_RERA_AGENT_NUMBER` | _(empty)_ | Never invented. Shown in the footer only once set. |
| Google Maps API key | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | _(empty → OpenStreetMap)_ | Set `NEXT_PUBLIC_MAP_PROVIDER=google` too. Restrict the key to your domain. |
| Analytics IDs | `NEXT_PUBLIC_GA4_ID`, `_GTM_ID`, `_META_PIXEL_ID`, `_CLARITY_ID` | _(empty → no scripts load)_ | |
| Search Console | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | _(empty)_ | |
| Social links | `NEXT_PUBLIC_SOCIAL_*` | _(empty → hidden)_ | |
| Lead email | `SMTP_*`, `LEAD_NOTIFICATION_EMAIL` | _(empty → leads logged to server console)_ | Leads are always saved to the database regardless. |

**Launch guard:** the build refuses `NEXT_PUBLIC_ALLOW_INDEXING=true` while any placeholder name,
phone or email is still set. While placeholders are in use, the footer also shows a small notice.

## 2. Demo content

- **20 demo properties, 5 demo projects, 1 demo agent, 5 demo testimonials, 3 demo blog posts.**
  All have `isDemo = true`, show a visible **Demo** badge or label, are `noindex`, and are excluded
  from the sitemap and structured data.
- Demo developer names end in "(Demo)" and are fictional. Project and person names are invented;
  any resemblance to real entities is unintended.
- **No RERA or JDA registration numbers were invented.** Demo records leave them empty.
- Demo prices are plausible for each locality but purely illustrative.
- Remove all demo rows with `npm run db:purge-demo` (SUPER_ADMIN can also do it from the admin
  panel once built). Re-running `npm run db:seed` restores demo rows to their seeded state.
- The 8 general FAQs are process-only (no legal or tax claims) and are **not** demo-flagged —
  review the wording, especially the brokerage answer, before launch.

## 2a. Copy, legal text and calculator rates — review before launch

| Item | Where | Status |
|---|---|---|
| Home "why us", hero and About copy | `lib/constants/marketing.ts` | Placeholder marketing copy. No statistics are claimed. |
| Privacy policy, terms, disclaimer | `app/(site)/privacy-policy`, `terms`, `disclaimer` | Templates (DPDP-aligned) showing a "pending legal review" notice until `LEGAL_REVIEWED = true` in `components/shared/legal-page.tsx`. |
| Stamp duty & registration rates | `lib/constants/tools.ts` | **Indicative placeholders** (6% / 5% / 5.5% + 1% registration). Verify current Rajasthan rates, then set `verified: true` and update `effectiveFrom`. |
| EMI defaults (8.5%, 20 years) | `lib/constants/tools.ts` | Reasonable defaults, not a lender quote. |
| Brokerage FAQ answer | seeded FAQ "Do you charge buyers or tenants a fee?" | Generic wording — replace with your actual policy. |

## 3. Locality data (SPEC §3)

- The 12 localities, zones, pincodes, centroid coordinates, descriptions and connectivity notes
  are **indicative** editorial content. Verify them before launch.
- `avgPricePerSqft` and `avgRent2Bhk` are indicative and always labelled "indicative" in the UI.
  Maintain them from the admin panel.
- Descriptions deliberately avoid exact distances and named institutions that may change.

## 4. Product & technical defaults

| Topic | Default chosen | Why / how to change |
|---|---|---|
| Spec | Reconstructed `docs/SPEC.md` adopted as the working spec | Original was unavailable. Replace sections as the real requirements arrive. |
| Stack | Next.js 16.3 (App Router, Turbopack), React 19.2, TypeScript strict, Tailwind 4, Prisma 7.10 + `@prisma/adapter-pg`, PostgreSQL 17, zod 4 | Latest stable at project start. Prisma's npm `latest` tag pointed at an 8.0 RC, so 7.10 (stable) is pinned. |
| Caching model | Next.js "previous model" (ISR with `revalidate`, on-demand `revalidatePath`) rather than `cacheComponents` | Simpler and well-understood; can migrate later. |
| Money | Whole rupees in `BigInt` columns; services convert to `number` | Avoids the ₹214 Cr cap of 32-bit ints. |
| Areas | Stored in sq ft; plots display in sq yd ("Gaj") | Jaipur convention. |
| Bigha | 1 bigha = 27,225 sq ft (Rajasthan "pucca" bigha) | Varies by region — single constant in `lib/format/area.ts`. |
| Property reference codes | `JP` + number from a Postgres sequence (`JP1001`…) | Seed resets the sequence after seeding. |
| Maps | OpenStreetMap embed (no key) by default; Google Maps embed when a key is set | Exact addresses hidden by default (`hideExactLocation`). |
| Admin auth | Email + password (bcrypt), DB-backed revocable sessions, httpOnly cookie | No default admin is created — run `npm run admin:create`. |
| Rate limiting | In-memory, per server instance | Fine for a single VPS/container. Use a shared store (e.g. Redis/Upstash) if you scale horizontally. |
| Uploads | `STORAGE_DRIVER=local` → `storage/uploads/`, served via `/media/...` | Needs a persistent disk. Use `s3` (S3/R2/Spaces/MinIO) on serverless hosts. |
| Email | nodemailer over SMTP; console fallback | Any SMTP provider works (Gmail Workspace, SES, Zoho, Brevo…). |
| Analytics consent | Off by default (`NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT=false`) | Set `true` to hold analytics until the visitor opts in (banner with "Allow" / "Essential only"). |
| View counts | First-party beacon (`/api/track/view`); one view per hashed visitor per listing per 30 min; bots ignored; no cookies | Independent of GA, so the admin dashboard works without analytics IDs. |
| Client IP | Right-most `X-Forwarded-For` entry, stepping back one entry per extra proxy (`TRUSTED_PROXY_COUNT`, default 1) | Left-hand entries are client-supplied and spoofable. The app must sit behind a proxy. |
| Deployment | Plain `next start` on a VPS, or the standalone Docker image; Caddy for HTTPS | See docs/DEPLOYMENT.md. Uploads directory configurable via `STORAGE_LOCAL_DIR`. |
| Security headers | CSP allowlisting GA4/GTM, Meta, Clarity, Turnstile, OSM/Google Maps and youtube-nocookie; HSTS only when `NEXT_PUBLIC_SITE_URL` is https in production | Add hosts in `next.config.ts` if you embed other services. |
| Language | English UI; Indian number formatting; IST for all dates | Hindi can be added later. |
| Brand colours | White page, deep navy primary (`brand-*`), warm gold accent (`gold-*`), soft grey surfaces (`surface-*`), WhatsApp green — defined once in `app/globals.css` | Palette requested 2026-09-29. Gold is for accents only; text on white uses `gold-700`+ for contrast. |
| Typography | Playfair Display (headings) + Manrope (body) via `next/font` | Aimed at an editorial, property-brochure feel rather than a SaaS dashboard. |
| Trust metrics | Stored in `SiteSetting` (`home.trustMetrics`), edited in Admin → Site settings. Default = live database counts only | Never invented numbers (SPEC §22). The schema's `Configuration` model means project unit types (2 BHK, 3 BHK…), so site settings got their own table. |
| Search entry URL | Home search submits to `/properties?tab=…`, which redirects to the canonical results page (`/buy`, `/rent`, `/buy/[locality]`, `/projects`) | Keeps one indexable URL per result set. |
| Stamp duty rates | Indicative constants with an "effective from" date and a disclaimer | Update `lib/constants/tools.ts` when rates change. |

## 5. Local development environment (this machine)

- Installed via winget on 2026-09-29: Node.js 24.19 LTS, PostgreSQL 17.11 (Windows service
  `postgresql-x64-17`, port 5432) and Git 2.55.
- Database `realestate` owned by role `realestate` (with `CREATEDB` for Prisma's shadow database).
  The password is only in the git-ignored `.env`.
- `.env` contains generated `AUTH_SECRET` and `IP_HASH_SALT`. Generate new ones for production.

## 6. Known limitations

- The Prisma CLI (dev dependency) pulls in `deepmerge-ts` 7 and `mysql2` ≤ 3.23, which have
  advisories. `package.json` `overrides` pin the fixed releases (`deepmerge-ts` 8, `mysql2`
  3.24); `prisma validate / generate / migrate` were re-verified with them and `npm audit`
  reports 0 vulnerabilities. Remove the overrides once Prisma ships updated dependencies.
- View de-duplication and rate limits are held in memory per server instance (plus a DB check
  for views). Behind multiple instances, counts can be slightly high until a shared store is added.
- The CSP keeps `'unsafe-inline'` for scripts (Next.js bootstrap, JSON-LD and the analytics
  snippets). A nonce-based CSP would force every page to render dynamically and lose ISR.
- There is deliberately no `loading.tsx` on public routes: a streamed shell turns 404s and
  redirects into `200` responses, which hurts SEO. Listing filters show their own pending state.
