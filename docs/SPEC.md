# Jaipur Real Estate Website — Product & Technical Specification

> **Status: v1.0 — working specification (adopted 2026-09-29).**
> The original `SPEC.md` was not available, so this version was reconstructed from the section
> references in the phase 0 brief and then adopted by the project owner as the spec to build from.
> These sections sit exactly where that brief points:
> **§3, §10, §11, §13, §24, §28, §34, §35, §36, §42, §52, §53, §57.**
> Decisions and placeholders made while building are recorded in `docs/ASSUMPTIONS.md`;
> the phase-by-phase delivery log is in `docs/IMPLEMENTATION_PLAN.md`.

Conventions: **MUST** = required, **SHOULD** = expected unless there is a stated reason not to,
**MAY** = optional. "Phase N" refers to the delivery plan in §61.

---

## Section index

| # | Section | # | Section |
|---|---------|---|---------|
| 1 | Overview & goals | 32 | Structured data |
| 2 | Users & personas | 33 | Sitemap & robots |
| 3 | Market & localities | 34 | Site configuration |
| 4 | Tech stack | 35 | Demo & seed content |
| 5 | Information architecture & URLs | 36 | Images & placeholders |
| 6 | Home page | 37 | Performance |
| 7 | Property listing page | 38 | Accessibility |
| 8 | Filters & sorting | 39 | Responsive & mobile-first |
| 9 | Property detail page | 40 | Design system |
| 10 | Projects | 41 | Admin panel overview |
| 11 | Localities & cities | 42 | Admin, CMS & supporting entities |
| 12 | Property taxonomy & enums | 43 | Admin auth & roles |
| 13 | Property data model | 44 | Admin: listings management |
| 14 | Media & gallery | 45 | Admin: lead management |
| 15 | Maps & location | 46 | Admin: content management |
| 16 | Compare | 47 | Analytics & events |
| 17 | Shortlist | 48 | Property view tracking |
| 18 | Calculators & tools | 49 | Legal & RERA compliance |
| 19 | Post your property (owner listing) | 50 | Privacy & consent |
| 20 | Agents | 51 | Language & localisation |
| 21 | Contact page | 52 | Price formatting |
| 22 | About page | 53 | Area & unit formatting |
| 23 | Blog | 54 | Dates, BHK, floors & misc formatting |
| 24 | WhatsApp & phone | 55 | Errors & empty states |
| 25 | Contact CTAs | 56 | Security |
| 26 | Enquiry forms | 57 | Environment variables |
| 27 | Site visit booking | 58 | Folder structure & conventions |
| 28 | Leads, site visits & owner listings (data model) | 59 | Quality gates |
| 29 | Notifications | 60 | Deployment & operations |
| 30 | Spam protection | 61 | Phased delivery plan |
| 31 | SEO metadata | 62 | Open questions |

---

## 1. Overview & goals

A website for a Jaipur-based real estate agency. It lists properties for sale and rent,
showcases new builder projects, publishes locality guides, and turns visitors into leads
through enquiry forms, WhatsApp, phone calls, site-visit requests and owner listings. Staff
manage listings, leads and content through an admin panel.

**Goals**
1. Generate qualified leads. Primary KPIs: leads per week, WhatsApp clicks, call clicks.
2. Rank locally for searches such as "3 BHK flat for sale in Vaishali Nagar Jaipur".
3. Load fast on mid-range Android phones over 4G (see §37).
4. Let non-technical staff run the site without a developer.

**Non-goals (v1)**
- Not a multi-vendor portal: no buyer accounts, no public agent sign-up.
- No online payments or token booking.
- No automated price estimates or valuations.

## 2. Users & personas

| Persona | Needs |
|---|---|
| End-use buyer | Find a home within budget in a preferred locality; trust signals (verified, RERA). |
| Investor | New launches, plots, price per sq ft, possession timelines. |
| Tenant | Rent, deposit, furnishing, availability date, tenant preference. |
| Owner / seller | List a property quickly and get a call back. |
| NRI buyer | WhatsApp-first contact, virtual tours, clear documentation. |
| Staff (admin / editor) | Manage listings, respond to leads fast, publish content. |

Assume at least 75% of traffic is mobile. Design mobile-first (§39).

## 3. Market & localities

Launch city: **Jaipur, Rajasthan**. The schema supports more cities (§11), but the UI
launches with Jaipur only.

The 12 launch localities are listed below. Pincodes and zones are indicative. **Verify them
before launch.** Admins can add more localities later.

| # | Locality | Slug | Zone | Primary pincode | Character |
|---|---|---|---|---|---|
| 1 | Vaishali Nagar | `vaishali-nagar` | West | 302021 | Established residential; apartments and independent houses; strong retail. |
| 2 | Malviya Nagar | `malviya-nagar` | South-East | 302017 | Premium residential and commercial; malls, hospitals, schools. |
| 3 | Mansarovar | `mansarovar` | South-West | 302020 | Large planned colony; metro connectivity; mid-segment housing. |
| 4 | C-Scheme | `c-scheme` | Central | 302001 | Prime central address; bungalows, premium apartments, offices. |
| 5 | Jagatpura | `jagatpura` | South-East | 302017 | Fast-growing; new apartment projects; near universities. |
| 6 | Tonk Road | `tonk-road` | South | 302018 | Arterial corridor near the airport; mixed residential and commercial. |
| 7 | Ajmer Road | `ajmer-road` | West | 302006 | Growth corridor; plotted developments and townships. |
| 8 | Raja Park | `raja-park` | Central-East | 302004 | Dense, established market area; builder floors and shops. |
| 9 | Bani Park | `bani-park` | Central-North | 302016 | Old established residential; near the railway station. |
| 10 | Vidhyadhar Nagar | `vidhyadhar-nagar` | North | 302039 | Planned sectors; independent houses and plots. |
| 11 | Pratap Nagar | `pratap-nagar` | South | 302033 | Housing-board colony; affordable to mid-segment. |
| 12 | Jhotwara | `jhotwara` | North-West | 302012 | Affordable housing; industrial-area proximity. |

## 4. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), latest stable at the start of phase 0 |
| Language | TypeScript with `strict: true` (plus `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS 4, with design tokens defined in one place (§40) |
| Database | PostgreSQL 16+ (developed against 17) |
| ORM | Prisma 7 with the `@prisma/adapter-pg` driver adapter; client generated to `generated/prisma`; migrations committed to `prisma/migrations` |
| Validation | zod, for env, forms and API inputs |
| Icons | lucide-react |
| Images | `next/image` |
| Forms | Server Actions + zod; react-hook-form on complex client forms |
| Email | nodemailer over SMTP (§29) |
| Maps | Leaflet + OpenStreetMap by default; Google Maps optional (§15) |
| Runtime | Node.js 20 LTS or newer |
| Package manager | npm |
| Local DB | Optional `docker-compose.yml` with Postgres |

## 5. Information architecture & URLs

| Route | Purpose |
|---|---|
| `/` | Home (§6) |
| `/buy`, `/rent` | Listings by transaction type (§7) |
| `/properties` | Home-search entry point; redirects to the canonical results page for the chosen tab (Buy / Rent / Commercial / Projects) |
| `/buy/[locality]`, `/rent/[locality]` | Locality-scoped listings (SEO landing) |
| `/property/[slug]` | Property detail (§9). The slug ends with the lowercased `refCode`. |
| `/projects`, `/projects/[slug]` | Projects (§10) |
| `/localities`, `/localities/[slug]` | Locality guides (§11) |
| `/post-property` | Owner listing form (§19) |
| `/blog`, `/blog/[slug]`, `/blog/category/[slug]` | Blog (§23) |
| `/about`, `/contact`, `/faq` | Static and CMS pages |
| `/tools/emi-calculator`, `/tools/area-converter`, `/tools/stamp-duty` | Tools (§18) |
| `/compare`, `/shortlist` | Client-side features (§16, §17), `noindex` |
| `/privacy-policy`, `/terms`, `/disclaimer` | Legal (§49) |
| `/admin/**` | Admin panel (§41), auth-protected, `noindex` |
| `/api/**` | Route handlers, where Server Actions aren't suitable |

Other filters (type, BHK, budget and so on) are query parameters on the listing routes.

## 6. Home page

In order:
1. Hero with search panel: tabs Buy / Rent / Commercial / Projects; fields Location, Type,
   Budget, BHK (BHK hidden for Commercial). Submits to `/properties`. Below it, popular
   searches generated from live inventory.
2. Trust metrics from `SiteSetting` (live counts or business-supplied values; never invented, §22).
3. Featured properties (up to 8, `isFeatured`).
4. Property categories with live counts.
5. Popular Jaipur locations (featured localities from §3).
6. New projects (up to 4).
7. "Why choose us" trust points.
8. Testimonials. Demo ones MUST carry a visible "Demo testimonial" label (§35).
9. Latest blog posts (3).
10. CTA: "Post your property" plus call / WhatsApp / enquiry, all from §34.

## 7. Property listing page

- Server-rendered. Filters are driven by the URL so results can be shared and indexed.
- 12 results per page, paginated server-side (`?page=`). No infinite scroll in v1.
- Grid on desktop, single column on mobile. Shows the result count and active filter chips.
- Card: cover image, price (§52), title, locality, BHK / area (§53, §54), key badges
  (Featured, Verified, RERA, **Demo**), and call/WhatsApp icons.
- Empty state per §55.

## 8. Filters & sorting

**Filters:** transaction type; property type (multi); locality (multi); budget (presets plus
custom min/max); BHK (1, 2, 3, 4, 5+); furnishing; construction status; area range; facing;
amenities (multi); listed by; verified only; has photos.

**Budget presets**

| Sale | Rent (per month) |
|---|---|
| Under ₹25 Lakh | Under ₹10,000 |
| ₹25 – 50 Lakh | ₹10,000 – 20,000 |
| ₹50 – 75 Lakh | ₹20,000 – 35,000 |
| ₹75 Lakh – ₹1 Cr | ₹35,000 – 50,000 |
| ₹1 – 2 Cr | Above ₹50,000 |
| Above ₹2 Cr | |

**Sort:** Relevance (featured first, then newest), Price low→high, Price high→low, Newest,
Price per sq ft, Area.

## 9. Property detail page

- Gallery (§14) with cover first. Shows a "Demo listing" banner when `isDemo`.
- Price block: price (§52), price per sq ft, negotiable flag, maintenance and deposit (rent).
- Key facts grid: type, BHK, areas, floor, facing, furnishing, construction status,
  possession or availability date, ownership, parking, age, JDA approval, RERA number.
- Description, amenities (icons), location (§15), project link if `projectId` is set.
- Agent card (§20), or the business contact when there is no agent.
- Sticky enquiry form on desktop; sticky bottom CTA bar on mobile (§25).
- Similar properties: same locality and transaction, ±25% price, up to 6.
- Status banners: SOLD or RENTED pages stay reachable with a "No longer available" banner
  and similar properties. They are excluded from search results.
- Structured data per §32. `noindex` when `isDemo`.

## 10. Projects

A **project** is a builder development (for example an apartment complex or plotted
township) with one or more unit **configurations**. Individual resale or rental properties
MAY link to a project.

### 10.1 `Project`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| name | String | |
| slug | String, unique | |
| developerName | String | Demo projects use fictional names ending in "(Demo)" (§35). |
| developerDescription | Text? | |
| reraNumber | String? | Rajasthan RERA registration. **Never fabricated** (§49). |
| status | PublishStatus | DRAFT / PUBLISHED / ARCHIVED |
| constructionStatus | ConstructionStatus | §12 |
| launchDate | DateTime? | |
| possessionDate | DateTime? | |
| totalUnits | Int? | |
| totalTowers | Int? | |
| totalFloors | Int? | |
| landAreaAcres | Float? | |
| description | Text | |
| highlights | String[] | Short bullet points |
| priceMin, priceMax | BigInt? | Whole rupees. Derived from configurations on save. |
| priceOnRequest | Boolean | default false |
| address | String? | |
| pincode | String? | |
| latitude, longitude | Float? | |
| cityId | FK City | |
| localityId | FK Locality | |
| brochureUrl | String? | Brochure download is gated behind a lead form. |
| videoUrl | String? | YouTube URL |
| isFeatured | Boolean | default false |
| isDemo | Boolean | default false |
| seoTitle, seoDescription | String? | |
| publishedAt | DateTime? | |
| createdAt, updatedAt | DateTime | |
| Relations | | `amenities` (M2M Amenity), `images` (ProjectImage[]), `configurations` (Configuration[]), `properties` (Property[]), `leads`, `siteVisits`, `faqs`, `views` |

Indexes: `[status, constructionStatus]`, `[localityId]`, `[cityId]`, `[isFeatured, status]`, `[publishedAt]`.

### 10.2 `ProjectImage`

Same shape as `PropertyImage` (§13.2), with `projectId` (cascade delete) instead of `propertyId`.

### 10.3 `Configuration` (unit type within a project)

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| projectId | FK Project | cascade delete |
| label | String | For example "3 BHK Apartment", "200 sq yd Plot" |
| propertyType | PropertyType | |
| bedrooms | Int? | |
| carpetAreaMin, carpetAreaMax | Float? | sq ft |
| superAreaMin, superAreaMax | Float? | sq ft (plot area for plotted projects) |
| priceMin, priceMax | BigInt? | whole rupees |
| unitsAvailable | Int? | |
| floorPlanUrl | String? | |
| sortOrder | Int | default 0 |

Index: `[projectId, sortOrder]`.

### 10.4 Project pages

- `/projects` lists published projects, filterable by locality and construction status.
- `/projects/[slug]` shows the hero gallery, price range (§52 ranges), a configurations
  table, highlights, amenities, location, developer, RERA, possession, a brochure CTA
  (lead-gated), linked resale/rent properties, project FAQs, and enquiry and site-visit
  forms.

## 11. Localities & cities

### 11.1 `City`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| name | String | "Jaipur" |
| slug | String, unique | "jaipur" |
| state | String | "Rajasthan" |
| isActive | Boolean | default true |
| sortOrder | Int | default 0 |
| createdAt, updatedAt | DateTime | |

### 11.2 `Locality`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| cityId | FK City | |
| name | String | |
| slug | String | unique per city |
| zone | String? | For example "West", "South-East" |
| pincode | String? | |
| description | Text? | Editorial overview |
| highlights | String[] | For example "Close to Ajmer Road", "Established markets" |
| connectivity | String[] | For example "Metro: 1 km", "Airport: 9 km" |
| latitude, longitude | Float? | Locality centroid |
| avgPricePerSqft | Int? | Indicative sale rate, manually maintained, labelled "indicative" in the UI |
| avgRent2Bhk | Int? | Indicative monthly rent, labelled "indicative" |
| imageUrl | String? | |
| isFeatured | Boolean | default false |
| sortOrder | Int | default 0 |
| seoTitle, seoDescription | String? | |
| createdAt, updatedAt | DateTime | |

Constraints and indexes: `@@unique([cityId, slug])`, `[cityId, isFeatured]`, `[name]`.

### 11.3 Locality pages

`/localities/[slug]` shows the overview, highlights, connectivity, live stats (active
listing count and live price range, computed from data), indicative rates, properties in the
locality (sale and rent tabs), projects, locality FAQs, nearby localities (same zone), and an
enquiry CTA with a locality-specific WhatsApp message (§24).

## 12. Property taxonomy & enums

Enum values below are used **verbatim** as Prisma enum members. Each has a display label
defined in `lib/constants` (§58). Labels are never derived by string manipulation.

**TransactionType:** `SALE` (Sale), `RENT` (Rent)

**PropertyCategory** (derived from type on save, stored for filtering): `RESIDENTIAL`, `COMMERCIAL`, `LAND`

**PropertyType**

| Value | Label | Category |
|---|---|---|
| `APARTMENT` | Apartment / Flat | RESIDENTIAL |
| `BUILDER_FLOOR` | Builder Floor | RESIDENTIAL |
| `INDEPENDENT_HOUSE` | Independent House | RESIDENTIAL |
| `VILLA` | Villa | RESIDENTIAL |
| `PENTHOUSE` | Penthouse | RESIDENTIAL |
| `STUDIO` | Studio / 1 RK | RESIDENTIAL |
| `FARMHOUSE` | Farmhouse | RESIDENTIAL |
| `RESIDENTIAL_PLOT` | Residential Plot | LAND |
| `COMMERCIAL_PLOT` | Commercial Plot | LAND |
| `AGRICULTURAL_LAND` | Agricultural Land | LAND |
| `OFFICE_SPACE` | Office Space | COMMERCIAL |
| `SHOP` | Shop | COMMERCIAL |
| `SHOWROOM` | Showroom | COMMERCIAL |
| `WAREHOUSE` | Warehouse / Godown | COMMERCIAL |

**ListingStatus** (the "status" of a property)

| Value | Public visibility |
|---|---|
| `DRAFT` | Hidden |
| `ACTIVE` | Listed and searchable |
| `UNDER_OFFER` | Listed, with an "Under offer" badge |
| `SOLD` | Detail page reachable with a banner; not in search |
| `RENTED` | Detail page reachable with a banner; not in search |
| `INACTIVE` | Hidden (404) |

**ConstructionStatus:** `UPCOMING`, `NEW_LAUNCH`, `UNDER_CONSTRUCTION`, `READY_TO_MOVE`

**Furnishing:** `UNFURNISHED`, `SEMI_FURNISHED`, `FULLY_FURNISHED`

**Facing:** `NORTH`, `NORTH_EAST`, `EAST`, `SOUTH_EAST`, `SOUTH`, `SOUTH_WEST`, `WEST`, `NORTH_WEST`

**OwnershipType:** `FREEHOLD`, `LEASEHOLD`, `COOPERATIVE_SOCIETY`, `POWER_OF_ATTORNEY`

**ListedBy:** `AGENCY`, `OWNER`, `BUILDER`

**TenantPreference:** `ANY`, `FAMILY`, `BACHELORS`, `COMPANY_LEASE`

**AreaUnit:** `SQFT`, `SQYD`, `SQM`, `ACRE`, `HECTARE`, `BIGHA` (§53)

**ImageKind:** `PHOTO`, `FLOOR_PLAN`, `MASTER_PLAN`, `LOCATION_MAP`

**AmenityCategory:** `BASIC`, `SECURITY`, `RECREATION`, `HEALTH_FITNESS`, `CONVENIENCE`, `ENVIRONMENT`

Lead, site-visit, owner-listing, content and admin enums are defined in §28 and §42.

## 13. Property data model

### 13.1 `Property`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| refCode | String, unique | Human-readable reference, for example `JP1001`. Sequential. Shown on the page and in WhatsApp messages. |
| slug | String, unique | kebab-case title + `-` + lowercased refCode |
| title | String | ≤ 120 chars |
| description | Text | Plain text with paragraphs |
| transactionType | TransactionType | |
| propertyType | PropertyType | |
| category | PropertyCategory | Derived from propertyType (§12) |
| status | ListingStatus | default `DRAFT` |
| constructionStatus | ConstructionStatus? | |
| listedBy | ListedBy | default `AGENCY` |
| price | BigInt? | Whole rupees. SALE = total price; RENT = monthly rent. Null when `priceOnRequest`. |
| priceOnRequest | Boolean | default false |
| isNegotiable | Boolean | default false |
| pricePerSqft | Int? | Derived for SALE: price ÷ primary area (§53.4) |
| maintenanceMonthly | Int? | Rupees per month |
| securityDeposit | BigInt? | RENT only |
| bookingAmount | BigInt? | |
| bedrooms | Int? | Null for plots and commercial; `STUDIO` uses 1 and displays "1 RK" |
| bathrooms | Int? | |
| balconies | Int? | |
| carpetArea | Float? | sq ft |
| builtUpArea | Float? | sq ft |
| superBuiltUpArea | Float? | sq ft |
| plotArea | Float? | sq ft (canonical). Displayed in `areaDisplayUnit`. |
| areaDisplayUnit | AreaUnit | default `SQFT`. Jaipur plots normally use `SQYD`. |
| plotLengthFt, plotWidthFt | Float? | |
| floorNumber | Int? | 0 = ground, -1 = basement |
| totalFloors | Int? | |
| facing | Facing? | |
| furnishing | Furnishing? | |
| ownershipType | OwnershipType? | |
| ageYears | Int? | Ready or resale only |
| possessionDate | DateTime? | Under construction |
| availableFrom | DateTime? | RENT |
| preferredTenants | TenantPreference[] | RENT |
| coveredParking, openParking | Int? | |
| roadWidthFt | Int? | |
| isCornerPlot | Boolean | default false |
| isGatedCommunity | Boolean | default false |
| jdaApproved | Boolean? | Jaipur Development Authority approval. Null = unknown. |
| reraNumber | String? | Never fabricated (§49) |
| address | String? | Hidden publicly when `hideExactLocation` |
| landmark | String? | |
| pincode | String? | 6 digits |
| latitude, longitude | Float? | |
| hideExactLocation | Boolean | default true. Map shows a locality-level circle instead. |
| cityId | FK City | |
| localityId | FK Locality | |
| projectId | FK Project? | |
| agentId | FK Agent? | |
| videoUrl | String? | YouTube |
| virtualTourUrl | String? | |
| isFeatured | Boolean | default false |
| isVerified | Boolean | default false. Staff have physically verified the listing. |
| isDemo | Boolean | default false (§35) |
| viewCount | Int | default 0. Denormalised from PropertyView (§48). |
| seoTitle, seoDescription | String? | |
| publishedAt | DateTime? | Set on first transition to ACTIVE |
| createdAt, updatedAt | DateTime | |
| Relations | | `amenities` (M2M Amenity), `images` (PropertyImage[]), `leads`, `siteVisits`, `views`, `faqs`, `ownerListing` (back-relation, §28) |

**Indexes** (all searched fields):
`[status, transactionType, propertyType]`, `[localityId, status]`, `[cityId, status]`,
`[status, price]`, `[status, bedrooms]`, `[isFeatured, status]`, `[status, publishedAt]`,
`[category]`, `[projectId]`, `[agentId]`, `[isDemo]`. Unique: `slug`, `refCode`.
Full-text search over title, description and locality (Postgres `tsvector`) is added in the
search phase.

### 13.2 `PropertyImage`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| propertyId | FK Property | cascade delete |
| url | String | Absolute URL or site-relative path |
| alt | String | **Required.** Descriptive alt text. |
| width, height | Int | Stored to prevent layout shift |
| kind | ImageKind | default `PHOTO` |
| caption | String? | |
| sortOrder | Int | default 0 |
| isCover | Boolean | default false. At most one per property (enforced in the service layer). |
| createdAt | DateTime | |

Index: `[propertyId, sortOrder]`.

### 13.3 `Amenity`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| name | String, unique | |
| slug | String, unique | |
| icon | String | lucide-react icon name, for example `"dumbbell"` |
| category | AmenityCategory | |
| sortOrder | Int | default 0 |

M2M with `Property` and `Project` (Prisma implicit many-to-many is acceptable).

## 14. Media & gallery

- Swipeable gallery with a full-screen lightbox and keyboard support. Cover first, then `sortOrder`.
- Tabs for Photos / Floor plans / Master plan when those `ImageKind`s exist.
- Video: YouTube embed via `youtube-nocookie.com`, lazy-loaded after interaction (a facade).
- Virtual tour: external link that opens in a new tab.

## 15. Maps & location

- Default provider: Leaflet with OpenStreetMap tiles (no API key needed). Lazy-loaded
  client component, never in the initial JS bundle.
- Optional Google Maps when `NEXT_PUBLIC_MAP_PROVIDER=google` and a key is set (§57).
- When `hideExactLocation` is true, show a ~500 m circle at the locality centroid, not a pin.
- The office map on `/contact` uses coordinates from §34.
- "Get directions" is shown for the office only, never for private listings.

## 16. Compare

Up to 3 properties, stored in `localStorage`. `/compare` shows a table of key facts.
Fields with differing values are highlighted.

## 17. Shortlist

Heart toggle on cards and detail pages, stored in `localStorage`. No login. `/shortlist`
lists saved properties, fetched fresh so price and status are current, and offers
"Share shortlist on WhatsApp".

## 18. Calculators & tools

- **EMI calculator:** loan amount, rate (default 8.5%), tenure (default 20 years).
  EMI = P·r·(1+r)^n / ((1+r)^n − 1). Shows a principal vs interest breakdown.
- **Area converter:** uses the §53 conversion table.
- **Stamp duty estimator (Rajasthan):** rates live in a single constants file with an
  "effective from" date and a disclaimer that they are indicative. Staff update them when
  rates change.

## 19. Post your property (owner listing)

- Public multi-step form: basics → location → price and area → photos → contact and consent.
- Creates an `OwnerListing` (§28) **and** a `Lead` with source `OWNER_LISTING`.
- Owner listings are **never auto-published**. Staff review them and convert one into a
  `Property` draft with one click, which sets `convertedPropertyId`.
- Photo upload arrives with the upload phase. Until then the form collects everything except
  photos.

## 20. Agents

- An agent card on property and project pages shows photo, name, designation, languages, and
  call/WhatsApp using the agent's numbers, falling back to the business numbers (§34).
- `/about` lists active agents. Individual agent pages (`/agents/[slug]`) MAY come later.
- Agents do not log in to v1 (§43). `Agent.adminId` exists for the future.

## 21. Contact page

Office address, phone, WhatsApp, email and office hours, **all from §34**. Also an office
map (§15) and a contact form that creates a Lead with source `CONTACT_FORM`.

## 22. About page

Story, team (agents) and trust points. Statistics ("X families served") MUST come from the
business or be omitted. **Never invent numbers or testimonials** (demo testimonials are
labelled, §35).

## 23. Blog

- `/blog` with category filter and pagination (9 per page). `/blog/[slug]` with table of
  contents, reading time, related posts and an enquiry CTA.
- Content is Markdown, rendered server-side and sanitised.
- Categories and posts are managed in the admin panel (§46).

## 24. WhatsApp & phone

### 24.1 Phone numbers

- **Storage:** E.164, for example `+919829012345`.
- **Normalisation** (`normalizeIndianPhone`): strip spaces, dashes, dots and parentheses;
  accept an optional `+91`, `91` or leading `0`; return E.164 or `null`.
- **Validation:** Indian mobile = 10 digits matching `^[6-9]\d{9}$` after stripping the
  country code. Landlines (for example Jaipur `0141` + 7 digits) are valid for the business
  phone only, not for lead forms.
- **Display** (`formatPhone`): mobile → `+91 98290 12345`; Jaipur landline → `+91 141 234 5678`.
- **Click-to-call:** `tel:+919829012345`.

### 24.2 WhatsApp link builder

- Format: `https://wa.me/<digits, no plus>?text=<encodeURIComponent(message)>`.
- Target number: the property's or project's agent WhatsApp if set, otherwise the business
  WhatsApp (§34).
- URLs inside messages are absolute, built from `siteUrl`.
- Messages are capped at 1,000 characters. Truncate the title first if needed.

**Message templates** (`{businessName}` and URLs come from config):

| Context | Template |
|---|---|
| General | `Hi {businessName}, I'm looking for a property in Jaipur. Please share details.` |
| Property | `Hi, I'm interested in this property:`⏎`{title}`⏎`Ref: {refCode}`⏎`Price: {formattedPrice}`⏎`{url}`⏎⏎`Please share more details.` |
| Project | `Hi, I'd like details about {projectName} in {localityName}.`⏎`{url}` |
| Locality | `Hi, I'm looking for properties in {localityName}, Jaipur.` |
| Site visit | `Hi, I'd like to schedule a site visit for {title} (Ref: {refCode}).` |
| Owner listing | `Hi, I want to list my property for {sale/rent} in {localityName}.` |
| Shortlist | `Hi, I'm interested in these properties:`⏎`{list of refCode – url}` |

### 24.3 Tracking

Every WhatsApp or call click fires an analytics event (`whatsapp_click` / `call_click`, §47)
with `context`, `propertyId` / `projectId`, and page path. Clicks don't create Leads, because
the visitor's number is unknown.

## 25. Contact CTAs

- **Mobile:** sticky bottom bar on property and project pages with **Call | WhatsApp | Enquire**.
  Elsewhere, a floating WhatsApp button (bottom-right, clear of the bar).
- **Desktop:** header shows the phone number and a WhatsApp button; detail pages have a
  sticky side enquiry card.
- Tap targets ≥ 44×44 px.

## 26. Enquiry forms

- **Fields:** name (2–60 chars), phone (Indian mobile, §24.1), email (optional), message
  (optional, ≤ 1,000 chars), consent checkbox (required, §50), and hidden context
  (propertyId / projectId / localityId, page URL, first-touch UTM params).
- **Variants:** Property enquiry, Project enquiry, Contact, Callback (name and phone only),
  Brochure request.
- **Flow:** Server Action → zod validation → spam checks (§30) → dedupe (same phone and same
  property within 24 h appends a LeadActivity instead of creating a new Lead) → save →
  notify (§29, non-blocking) → success state that offers WhatsApp follow-up.
- Errors appear inline per field. The form keeps its values on error.

## 27. Site visit booking

- Date: tomorrow up to 14 days ahead. Slots: hourly, 10:00–19:00 IST. Sundays are allowed
  (configurable).
- Creates a Lead (source `SITE_VISIT_REQUEST`, status `SITE_VISIT_SCHEDULED`) and a
  `SiteVisit` (status `REQUESTED`). Staff confirm by phone or WhatsApp, then set `CONFIRMED`.

## 28. Leads, site visits & owner listings (data model)

### 28.1 Enums

**LeadStatus:** `NEW`, `CONTACTED`, `QUALIFIED`, `SITE_VISIT_SCHEDULED`, `SITE_VISIT_DONE`,
`NEGOTIATION`, `WON`, `LOST`, `SPAM`

**LeadSource:** `PROPERTY_ENQUIRY`, `PROJECT_ENQUIRY`, `CONTACT_FORM`, `CALLBACK_REQUEST`,
`SITE_VISIT_REQUEST`, `BROCHURE_REQUEST`, `OWNER_LISTING`, `WHATSAPP`, `PHONE_CALL`,
`WALK_IN`, `REFERRAL`, `OTHER`
(`WHATSAPP`, `PHONE_CALL`, `WALK_IN` and `REFERRAL` are entered manually by staff.)

**LeadActivityType:** `NOTE`, `CALL`, `WHATSAPP`, `EMAIL`, `MEETING`, `STATUS_CHANGE`,
`ASSIGNMENT`, `REPEAT_ENQUIRY`

**SiteVisitStatus:** `REQUESTED`, `CONFIRMED`, `RESCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`

**OwnerListingStatus:** `PENDING_REVIEW`, `CONTACTED`, `APPROVED`, `REJECTED`, `CONVERTED`

### 28.2 `Lead`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| name | String | |
| phone | String | E.164 |
| email | String? | |
| message | Text? | |
| source | LeadSource | |
| status | LeadStatus | default `NEW` |
| propertyId | FK Property? | set null on delete |
| projectId | FK Project? | set null on delete |
| localityId | FK Locality? | |
| assignedAgentId | FK Agent? | |
| transactionType | TransactionType? | What the lead is looking for |
| budgetMin, budgetMax | BigInt? | |
| preferredDate | DateTime? | Callback or visit preference |
| followUpAt | DateTime? | |
| pageUrl | String? | |
| referrer | String? | |
| utmSource, utmMedium, utmCampaign, utmTerm, utmContent | String? | First-touch attribution |
| consentAt | DateTime | Consent timestamp (§50) |
| isSpam | Boolean | default false |
| createdAt, updatedAt | DateTime | |

Indexes: `[status, createdAt]`, `[phone]`, `[source, createdAt]`, `[assignedAgentId, status]`,
`[propertyId]`, `[projectId]`, `[followUpAt]`.

### 28.3 `LeadActivity`

id, leadId (FK, cascade), type (LeadActivityType), body (Text?), createdByAdminId (FK Admin?),
createdAt. Index `[leadId, createdAt]`.

### 28.4 `SiteVisit`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| leadId | FK Lead | cascade delete |
| propertyId | FK Property? | |
| projectId | FK Project? | |
| agentId | FK Agent? | |
| scheduledAt | DateTime | Stored in UTC, displayed in IST |
| status | SiteVisitStatus | default `REQUESTED` |
| notes | Text? | |
| feedback | Text? | Filled in after the visit |
| createdAt, updatedAt | DateTime | |

Indexes: `[scheduledAt, status]`, `[leadId]`, `[agentId, scheduledAt]`, `[propertyId]`.

### 28.5 `OwnerListing`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| ownerName | String | |
| ownerPhone | String | E.164 |
| ownerEmail | String? | |
| transactionType | TransactionType | |
| propertyType | PropertyType | |
| cityId | FK City? | |
| localityId | FK Locality? | |
| localityText | String? | When the locality isn't in the list |
| address | String? | |
| expectedPrice | BigInt? | |
| area | Float? | In `areaUnit` as entered |
| areaUnit | AreaUnit | default `SQFT` |
| bedrooms | Int? | |
| description | Text? | |
| imageUrls | String[] | |
| status | OwnerListingStatus | default `PENDING_REVIEW` |
| reviewNotes | Text? | |
| leadId | FK Lead?, unique | The lead created alongside |
| convertedPropertyId | FK Property?, unique | |
| consentAt | DateTime | |
| createdAt, updatedAt | DateTime | |

Indexes: `[status, createdAt]`, `[ownerPhone]`.

### 28.6 Retention

Leads marked `SPAM` are purged after 90 days. Other leads are retained until deleted by an
admin, or on a data-principal request (§50).

## 29. Notifications

- Email to `LEAD_NOTIFICATION_EMAIL` for every new Lead, OwnerListing and SiteVisit, sent via
  SMTP (§57). The email includes a deep link to the admin record.
- Send failures are logged and **never** block saving the lead.
- If the visitor gave an email, they MAY receive an acknowledgement email.
- WhatsApp Business API notifications are out of scope for v1.

## 30. Spam protection

- Hidden honeypot field; submissions faster than 3 seconds after render are rejected.
- Rate limit: 5 submissions per 10 minutes per hashed IP (§48 hashing). In-memory for a
  single instance; swappable for a shared store later.
- Optional Cloudflare Turnstile when its keys are set (§57).
- Suspect submissions are saved with `isSpam = true` / status `SPAM` rather than dropped,
  so staff can review them.

## 31. SEO metadata

- Titles and descriptions via the Next.js Metadata API, built from templates in `lib/seo`.
  Example property title: `3 BHK Apartment for Sale in Vaishali Nagar, Jaipur – ₹85 Lakh | {businessName}`.
- Canonical URLs always use `siteUrl` (§34).
- Open Graph image: the listing cover image, or a default OG image.
- Listing pages with more than two filter facets, or with pagination beyond page 1 plus
  filters, are `noindex, follow`.
- **Any page for an `isDemo` record MUST be `noindex`**, so demo listings are never indexed
  as real ones.

## 32. Structured data

JSON-LD built in `lib/seo`:
- Sitewide: `RealEstateAgent` (LocalBusiness) from §34.
- `BreadcrumbList` on all nested pages.
- Property: `RealEstateListing` with `Offer` (price in INR).
- Project: `Residence` / `Place` plus `Offer` price range.
- FAQ pages and sections: `FAQPage`. Blog: `BlogPosting`.
- Demo records emit **no** listing structured data.

## 33. Sitemap & robots

- `app/sitemap.ts` builds the sitemap dynamically from published, non-demo records.
- `app/robots.ts` disallows `/admin`, `/api`, `/compare`, `/shortlist`.
- When `NEXT_PUBLIC_ALLOW_INDEXING` is not `"true"` (staging/preview), disallow everything
  and send `noindex` sitewide.

## 34. Site configuration

A single module, **`lib/config`**, exposes the business identity and integration IDs.
**It is the only module that reads these environment variables. No other file may hardcode
the business name, phone, WhatsApp, email, address, site URL or analytics IDs.** Components,
services, the seed script, SEO helpers and email templates all import from `lib/config`.

### 34.1 Fields

| Key (in `siteConfig`) | Env var (§57) | Required | Notes |
|---|---|---|---|
| `name` | `NEXT_PUBLIC_BUSINESS_NAME` | yes | Brand name |
| `legalName` | `NEXT_PUBLIC_BUSINESS_LEGAL_NAME` | no | Defaults to `name` |
| `tagline` | `NEXT_PUBLIC_BUSINESS_TAGLINE` | no | |
| `phone` | `NEXT_PUBLIC_BUSINESS_PHONE` | yes | Normalised to E.164 at load time (§24) |
| `secondaryPhone` | `NEXT_PUBLIC_BUSINESS_PHONE_SECONDARY` | no | |
| `whatsapp` | `NEXT_PUBLIC_BUSINESS_WHATSAPP` | no | Defaults to `phone`. Must be a mobile number. |
| `email` | `NEXT_PUBLIC_BUSINESS_EMAIL` | yes | |
| `address.line1` / `line2` | `NEXT_PUBLIC_BUSINESS_ADDRESS_LINE1` / `_LINE2` | line1 yes | |
| `address.city` | `NEXT_PUBLIC_BUSINESS_CITY` | yes | "Jaipur" |
| `address.state` | `NEXT_PUBLIC_BUSINESS_STATE` | yes | "Rajasthan" |
| `address.pincode` | `NEXT_PUBLIC_BUSINESS_PINCODE` | yes | 6 digits |
| `address.country` | — | — | Constant `"IN"` |
| `geo.lat` / `geo.lng` | `NEXT_PUBLIC_BUSINESS_LAT` / `_LNG` | no | Office map and LocalBusiness schema |
| `officeHours` | `NEXT_PUBLIC_BUSINESS_HOURS` | no | For example `Mon–Sat 10:00–19:00` |
| `reraAgentNumber` | `NEXT_PUBLIC_RERA_AGENT_NUMBER` | no | Shown in the footer when set |
| `social.*` | `NEXT_PUBLIC_SOCIAL_FACEBOOK`, `_INSTAGRAM`, `_YOUTUBE`, `_LINKEDIN`, `_X` | no | Omitted from the UI when empty |
| `siteUrl` | `NEXT_PUBLIC_SITE_URL` | yes | Absolute, no trailing slash |
| `analytics.ga4Id` | `NEXT_PUBLIC_GA4_ID` | no | `G-XXXXXXX` |
| `analytics.gtmId` | `NEXT_PUBLIC_GTM_ID` | no | `GTM-XXXXXX` |
| `analytics.metaPixelId` | `NEXT_PUBLIC_META_PIXEL_ID` | no | |
| `analytics.clarityId` | `NEXT_PUBLIC_CLARITY_ID` | no | |
| `analytics.googleSiteVerification` | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | no | |
| `allowIndexing` | `NEXT_PUBLIC_ALLOW_INDEXING` | no | `"true"` only in production |

### 34.2 Rules

- Validated with zod when first loaded. Invalid or missing required values throw an error
  that lists **every** problem at once. The build fails rather than shipping a broken
  contact number.
- Business identity is public information, so it uses `NEXT_PUBLIC_` variables and client
  components can import it. `NEXT_PUBLIC_` values are inlined at build time, so **changing
  them requires a rebuild**.
- Server-only settings (database, SMTP, secrets) live in a separate server-only export
  (`lib/config/server.ts`, guarded with `import "server-only"`) and are never `NEXT_PUBLIC_`.
- Empty strings are treated as "not set".

## 35. Demo & seed content

Demo content lets the site be built and reviewed before real inventory exists. It must be
impossible to mistake for real listings.

### 35.1 Marking rules

- Every demo record has **`isDemo = true`** (Property, Project, Agent, Testimonial, and
  BlogPost if any).
- The UI shows a visible **"Demo"** badge on demo cards and a banner on demo detail pages.
  Demo testimonials show **"Demo testimonial"**.
- Demo property and project descriptions end with:
  *"Demo listing — for illustration only. This is not an actual property offered for sale or rent."*
- Demo developer names are fictional and end in **"(Demo)"**. They must not resemble real
  Jaipur developers.
- **Never** fabricate RERA numbers, JDA approval numbers or real people's contact details.
  Demo records leave `reraNumber` null. The demo agent has no phone of its own and falls
  back to the business phone from §34.
- Demo pages are `noindex`, and demo records are excluded from the sitemap and structured
  data (§31–33).
- A purge script (`npm run db:purge-demo`, in the admin phase) deletes all `isDemo` rows.

### 35.2 Required seed content

| Content | Minimum | Requirements |
|---|---|---|
| City | 1 | Jaipur, Rajasthan |
| Localities | 12 | Exactly the §3 list, with descriptions, highlights, centroid coordinates and indicative rates |
| Amenities | ~20 | See §35.3 |
| Agent | 1 | Demo agent, `isDemo`, placeholder avatar |
| Projects | 4–5 | Mixed construction statuses; 2–4 configurations each; placeholder images; amenities |
| Properties | 15+ | See the mix below; each with 3–5 placeholder images and amenities |
| Testimonials | 4–6 | Fictional names, `isDemo`, labelled |
| Blog categories | MAY | For example Buying Guide, Locality Insights, Legal & Documentation |
| General FAQs | MAY | Process questions only (for example "How do I book a site visit?"), no legal or tax claims |

**Property mix (at least):**
- ≥ 10 SALE and ≥ 5 RENT.
- Spread across ≥ 8 of the 12 localities.
- Types: ≥ 5 apartments, ≥ 2 independent houses or villas, ≥ 2 residential plots (area in
  SQYD), ≥ 1 builder floor, ≥ 2 commercial (office or shop).
- BHK from 1 to 5. Every furnishing value used at least once; every construction status used
  at least once across properties and projects.
- Sale prices from about ₹18 Lakh to ₹4.5 Cr. Rents from about ₹8,000 to ₹85,000 per month.
  Prices must be plausible for the locality (indicatively ₹3,500–₹12,000 per sq ft).
- ≥ 4 `isFeatured`, ≥ 3 `isVerified`, ≥ 3 linked to a demo project.
- All `status = ACTIVE`, except one `UNDER_OFFER` and one `SOLD` to exercise the banners.

### 35.3 Amenity list

Lift; Power Backup; 24×7 Security; CCTV Surveillance; Gated Community; Covered Parking;
Visitor Parking; Swimming Pool; Gymnasium; Clubhouse; Children's Play Area; Landscaped
Garden; Jogging Track; Indoor Games; Community Hall; Rainwater Harvesting; Solar Power;
Piped Gas; 24×7 Water Supply; Intercom; Fire Safety; Vaastu Compliant; Temple.

### 35.4 Seed mechanics

- `prisma/seed.ts`, run with `npm run db:seed` (also wired to `prisma db seed`).
- **Idempotent:** upsert by natural keys (slug or refCode), so it can be re-run safely.
- Seed data lives in `prisma/seed-data/*.ts`, separate from the seed logic.
- Contact details come from `lib/config`, never literals in seed files.
- The seed MUST NOT create an admin user with a default password. Admin bootstrap is a
  separate script in the auth phase (§43).
- `npm run db:reset` drops, migrates and re-seeds (development only).

## 36. Images & placeholders

- **No hotlinked or copyrighted stock photos.** Placeholders are local SVGs in
  `public/placeholders/`. There is one per type: apartment, house, villa, plot, commercial,
  project, locality, agent avatar, blog cover, and OG default. Each is a neutral
  illustration that includes the text **"Demo image"**.
- Every image record stores `alt`, `width` and `height`.
- All images render through `next/image`. SVG placeholders use `unoptimized`; don't enable
  `dangerouslyAllowSVG` globally.
- Aspect ratios: 4:3 for cards and gallery thumbnails, 16:9 for hero and detail main image.
- Cover image = the `isCover` image, otherwise the lowest `sortOrder`, otherwise the type
  placeholder.
- **Uploads (later phase):** JPEG, PNG or WebP; ≤ 8 MB each; resized so the long edge is at
  most 2,400 px; converted to WebP; EXIF stripped (including GPS). Stored through a driver:
  `local` (`storage/uploads`, served by the `/media/[...path]` route handler — Next.js does not
  serve files added to `public/` after the build) or S3-compatible (§57).
  `next.config` `remotePatterns` is built from the configured storage host.

## 37. Performance

- Targets on a mid-range Android over 4G: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
- ≤ 170 KB gzipped first-load JS on listing and detail pages.
- Detail pages use ISR (`revalidate` 300 s) plus on-demand revalidation when admins save.
- Maps, lightbox, video and analytics are lazy-loaded.
- Fonts via `next/font`, subset, `display: swap`.

## 38. Accessibility

WCAG 2.2 AA: keyboard navigable, visible focus, labelled form controls, errors announced,
contrast ≥ 4.5:1, alt text required by the admin UI, `prefers-reduced-motion` respected.

## 39. Responsive & mobile-first

Mobile-first Tailwind with default breakpoints. 16 px side gutter on mobile, no horizontal
scroll, tap targets ≥ 44 px, and a body font size of at least 16 px on form inputs (prevents
iOS zoom).

## 40. Design system

- Colour, radius, spacing and typography tokens are defined once (Tailwind theme and CSS
  variables in `app/globals.css`). Components never use raw hex values.
- Core components in `components/ui`: Button, Badge (Demo / Verified / Featured / RERA /
  Under offer), Card, Input, Select, Checkbox, Dialog, Sheet, Tabs, Skeleton, Pagination.
- Palette: white background, deep navy primary, warm gold accent, soft grey surfaces, WhatsApp
  green. Headings in Playfair Display, body in Manrope. The logo is still an open question (§62).
- Layout: sticky header (shadow once scrolled) with Call + WhatsApp on the right and a
  hamburger menu below desktop width; floating WhatsApp button on tablet/desktop; sticky
  Call / WhatsApp bar on phones (detail pages replace it with a listing-specific bar).
- Shared components: PropertyCard, ProjectCard, LocationCard, SearchBar, EmptyState, Breadcrumb,
  CallButton, WhatsAppButton.

## 41. Admin panel overview

`/admin`, auth-protected (§43) and `noindex`. The dashboard shows: new leads (today and
7 days), leads by source, upcoming site visits, owner listings pending review, active
listings by transaction type, and the most-viewed properties (7 days, §48).

## 42. Admin, CMS & supporting entities

### 42.1 Enums

**AdminRole:** `SUPER_ADMIN`, `ADMIN`, `EDITOR`
**PublishStatus:** `DRAFT`, `PUBLISHED`, `ARCHIVED`
**FaqScope:** `GENERAL`, `BUYING`, `RENTING`, `SELLING`, `HOME_LOANS`, `LEGAL`, `PROPERTY`, `PROJECT`, `LOCALITY`

### 42.2 `Admin`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| email | String, unique | Stored lowercased |
| name | String | |
| passwordHash | String | argon2id or bcrypt (§43) |
| role | AdminRole | default `EDITOR` |
| isActive | Boolean | default true |
| lastLoginAt | DateTime? | |
| createdAt, updatedAt | DateTime | |

### 42.3 `Agent`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| name | String | |
| slug | String, unique | |
| designation | String? | For example "Senior Property Consultant" |
| phone | String? | E.164. Null = use business phone (§34). |
| whatsapp | String? | E.164. Null = fall back to phone, then business WhatsApp. |
| email | String? | |
| photoUrl | String? | |
| bio | Text? | |
| languages | String[] | For example ["Hindi", "English"] |
| experienceYears | Int? | |
| reraAgentNumber | String? | Never fabricated |
| isActive | Boolean | default true |
| isDemo | Boolean | default false |
| sortOrder | Int | default 0 |
| adminId | FK Admin?, unique | Future agent login |
| createdAt, updatedAt | DateTime | |

Index: `[isActive, sortOrder]`.

### 42.4 `BlogCategory`

id, name (unique), slug (unique), description (Text?), sortOrder, createdAt, updatedAt.

### 42.5 `BlogPost`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| title | String | |
| slug | String, unique | |
| excerpt | String | ≤ 300 chars |
| content | Text | Markdown |
| coverImageUrl, coverImageAlt | String? | |
| status | PublishStatus | default `DRAFT` |
| publishedAt | DateTime? | |
| readingTimeMinutes | Int? | Computed on save |
| tags | String[] | |
| categoryId | FK BlogCategory? | |
| authorId | FK Admin? | |
| isDemo | Boolean | default false |
| seoTitle, seoDescription | String? | |
| createdAt, updatedAt | DateTime | |

Indexes: `[status, publishedAt]`, `[categoryId, status]`.

### 42.6 `FAQ`

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| question | String | |
| answer | Text | Markdown |
| scope | FaqScope | |
| propertyId / projectId / localityId | FK? | Set when scope is PROPERTY / PROJECT / LOCALITY |
| sortOrder | Int | default 0 |
| isPublished | Boolean | default true |
| createdAt, updatedAt | DateTime | |

Indexes: `[scope, isPublished, sortOrder]`, `[projectId]`, `[localityId]`, `[propertyId]`.

### 42.7 `Testimonial`

id, name, location (String?), context (String?, for example "Bought a 3 BHK in Vaishali
Nagar"), quote (Text), rating (Int? 1–5), photoUrl (String?), isPublished (default true),
isDemo (default false), sortOrder, createdAt, updatedAt.
Index `[isPublished, sortOrder]`.

### 42.8 `PropertyView` (behaviour in §48)

| Field | Type | Notes |
|---|---|---|
| id | cuid | |
| propertyId | FK Property? | cascade delete |
| projectId | FK Project? | cascade delete |
| viewedAt | DateTime | default now |
| visitorHash | String | SHA-256 of (IP + user agent + daily salt). **No raw IP is stored.** |
| referrer | String? | |
| utmSource, utmMedium, utmCampaign | String? | |
| deviceType | String? | `mobile` / `tablet` / `desktop` |

Indexes: `[propertyId, viewedAt]`, `[projectId, viewedAt]`, `[viewedAt]`, `[visitorHash, propertyId, viewedAt]`.

### 42.9 `AuditLog`

id, adminId (FK Admin?), action (String, for example `property.update`), entityType,
entityId, changes (Json?), createdAt. Index `[entityType, entityId]`, `[createdAt]`.

### 42.10 `AdminSession`

Server-side sessions so logins can be listed and revoked (logout, deactivation, password
change). id, adminId (FK Admin, cascade), tokenHash (unique — SHA-256 of the random cookie
token; the raw token is never stored), expiresAt, userAgent (String?), createdAt, lastSeenAt.
Indexes `[adminId]`, `[expiresAt]`.

## 43. Admin auth & roles

- Email and password. Passwords hashed with argon2id (bcrypt acceptable). Sessions use an
  httpOnly, Secure, SameSite=Lax cookie holding a random token (stored hashed in
  `AdminSession`, §42.10), lasting 7 days.
- Login is rate-limited (5 attempts per 15 minutes per email + IP hash) with a generic error
  message.
- The first admin is created with `npm run admin:create` (interactive CLI). There are no
  default credentials.

| Capability | SUPER_ADMIN | ADMIN | EDITOR |
|---|---|---|---|
| Manage admins | ✔ | | |
| Properties / projects / localities | ✔ | ✔ | read |
| Leads / site visits / owner listings | ✔ | ✔ | |
| Blog / FAQ / testimonials | ✔ | ✔ | ✔ |
| Purge demo data | ✔ | | |

## 44. Admin: listings management

CRUD for properties, projects (with configurations), localities and amenities. Includes an
image manager (upload, reorder, set cover, alt text required), status transitions, duplicate
listing, bulk feature/unfeature, and a preview before publishing. Every save writes to
`AuditLog` and triggers on-demand revalidation.

## 45. Admin: lead management

Lead inbox with filters (status, source, agent, date); a lead detail page with an activity
timeline (§28.3); quick actions (call, WhatsApp using §24 builders, change status, assign,
schedule follow-up); a site-visit calendar and list; an owner-listing review queue with
"Convert to property"; CSV export (ADMIN and above).

## 46. Admin: content management

Blog posts (Markdown editor with preview), categories, FAQs (scoped), and testimonials
(demo flag visible).

## 47. Analytics & events

- Scripts load only when their ID is set in §34, and only after consent if
  `NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT=true` (§50).
- A single `track(event, params)` helper in `lib/analytics` sends to whichever of GA4, GTM
  and Meta Pixel are configured.
- **Events:** `search`, `property_view`, `project_view`, `enquiry_submit`, `whatsapp_click`,
  `call_click`, `site_visit_request`, `owner_listing_submit`, `brochure_download`,
  `shortlist_add`, `compare_add`. Meta Pixel `Lead` fires on every successful form submit.

## 48. Property view tracking

- On a property or project detail request, a `PropertyView` is recorded server-side,
  outside the render path (fire and forget).
- Deduplicated: one view per `visitorHash` per listing per 30 minutes. Obvious bots
  (user-agent check) are excluded.
- `Property.viewCount` is incremented alongside.
- The daily salt rotates every day (derived from `IP_HASH_SALT` + date), so hashes cannot be
  linked across days.

## 49. Legal & RERA compliance

- Show the Rajasthan RERA registration number for any project or property where it applies.
  Show the agent registration number in the footer when set (§34).
- **Never fabricate RERA, JDA or other registration numbers.** If unknown, leave the field
  null and don't display it.
- A disclaimer in the footer and on detail pages says images are indicative and details
  should be verified before transacting.
- Pages: Privacy Policy, Terms of Use, Disclaimer. Content is supplied by the business;
  placeholders are clearly marked until then.

## 50. Privacy & consent

- Complies with India's Digital Personal Data Protection Act, 2023: a clear purpose
  statement next to each form, a required consent checkbox, `consentAt` recorded, and
  deletion on request.
- No raw IP addresses are stored (§48).
- Analytics consent banner: when `NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT=true`, non-essential
  scripts wait for opt-in. The default choice is essential-only.

## 51. Language & localisation

- English UI in v1, structured so Hindi can be added later. UI strings SHOULD NOT be
  scattered in deeply nested logic.
- All user-facing numbers use Indian grouping (§52). Times are shown in IST
  (`Asia/Kolkata`).
- Include a Devanagari-capable fallback font for future Hindi content.

## 52. Price formatting

All functions live in `lib/format/price.ts` and accept `number | bigint` in **whole rupees**.

### 52.1 Rules

1. **Indian digit grouping:** the last 3 digits, then groups of 2 (`12,34,56,789`), via
   `Intl.NumberFormat('en-IN')`.
2. **Below ₹1,00,000:** full amount. `85000` → `₹85,000`.
3. **₹1 Lakh to below ₹1 Cr:** value ÷ 1,00,000, at most 2 decimals, trailing zeros trimmed,
   suffix **"Lakh"** (never "Lakhs" or "Lac").
   `4500000` → `₹45 Lakh`; `4550000` → `₹45.5 Lakh`; `100000` → `₹1 Lakh`.
4. **₹1 Cr and above:** value ÷ 1,00,00,000, at most 2 decimals, trimmed, suffix **"Cr"**.
   `12500000` → `₹1.25 Cr`; `100000000` → `₹10 Cr`.
5. **Rounding** is half-up to 2 decimals. If rounding a Lakh value produces 100, promote it
   to Cr: `9999999` → `₹1 Cr`, not `₹100 Lakh`.
6. **Full style** (`{ style: 'full' }`): Indian-grouped full amount. `4500000` → `₹45,00,000`.
7. **Rent:** append `/month`. `18000` → `₹18,000/month`; `120000` → `₹1.2 Lakh/month`.
8. **Price on request, null, negative or NaN:** `Price on Request`.
9. **Per sq ft:** whole rupees, grouped. `5200` → `₹5,200/sq ft`.

### 52.2 Ranges (`formatPriceRange(min, max)`)

| Input | Output |
|---|---|
| 45 L – 60 L (same unit) | `₹45 – 60 Lakh` |
| 45 L – 1.2 Cr | `₹45 Lakh – ₹1.2 Cr` |
| 1.1 Cr – 1.8 Cr | `₹1.1 – 1.8 Cr` |
| min only | `From ₹45 Lakh` |
| max only | `Up to ₹60 Lakh` |
| min = max | `₹45 Lakh` |
| neither | `Price on Request` |

The separator is an en dash with spaces (` – `).

### 52.3 Parsing (`parsePrice`)

Parses user or URL input into rupees for filters: `"45L"`, `"45 lakh"`, `"45 lac"` → 4500000;
`"1.2cr"`, `"1.2 crore"` → 12000000; `"85k"` → 85000; `"4500000"` or `"45,00,000"` → 4500000.
Case- and whitespace-insensitive. Invalid input → `null`.

## 53. Area & unit formatting

All functions live in `lib/format/area.ts`. **Canonical storage is square feet.**

### 53.1 Units

| AreaUnit | Label (singular / plural) | sq ft per unit |
|---|---|---|
| `SQFT` | sq ft | 1 |
| `SQYD` | sq yd (also known locally as "Gaj") | 9 |
| `SQM` | sq m | 10.7639 |
| `ACRE` | acre / acres | 43,560 |
| `HECTARE` | hectare / hectares | 107,639.1 |
| `BIGHA` | bigha | 27,225 (Rajasthan pucca bigha, kept as a single named constant because bigha varies by region) |

### 53.2 Formatting

- `convertArea(value, from, to)` is exact arithmetic. `formatArea(sqft, unit)` converts from
  sq ft for display.
- Decimals: 0 for SQFT, SQYD and SQM (rounded); up to 2 (trimmed) for ACRE, HECTARE and BIGHA.
- Indian grouping: `1250` sq ft → `1,250 sq ft`; `1800` sq ft as SQYD → `200 sq yd`;
  `108900` sq ft as ACRE → `2.5 acres`; `43560` as ACRE → `1 acre`.
- Dual display (`formatAreaDual`): `1,800 sq ft (200 sq yd)`. Used on plot detail pages.
- Dimensions: `30 × 60 ft`.
- Null, zero or negative → `—`.

### 53.3 Which area to show

| Category | Primary area (first non-null) | Label suffix |
|---|---|---|
| RESIDENTIAL (built) | superBuiltUp → builtUp → carpet | `(super built-up)` / `(built-up)` / `(carpet)` on detail pages |
| LAND | plotArea in `areaDisplayUnit` | — |
| COMMERCIAL | carpet → builtUp → superBuiltUp | as above |

### 53.4 Price per area

`pricePerSqft` = price ÷ primary area in sq ft, rounded to whole rupees. For plots it MAY
also be shown per sq yd (`₹32,000/sq yd`).

## 54. Dates, BHK, floors & misc formatting

In `lib/format`:
- **Dates:** `12 Oct 2026`; possession `Dec 2027`; relative for listing age (`Listed 3 days ago`).
  Always in the `Asia/Kolkata` time zone.
- **BHK:** `3 BHK`. `STUDIO` → `1 RK`. `5+` for 5 or more in filters.
- **Floor:** `Ground floor`, `Basement`, `3rd of 12 floors`, `3rd floor` when the total is unknown.
- **Counts:** correct plurals (`1 bathroom`, `2 bathrooms`).
- **Enum labels:** from the maps in `lib/constants` (§12).

## 55. Errors & empty states

- A custom 404 page with search, popular localities and a WhatsApp CTA.
- An error boundary per route segment with a friendly message and retry. Errors are logged
  server-side.
- Empty search results: show the active filters, suggest relaxing the most restrictive one,
  show nearby or similar results, and offer "Tell us what you need" on WhatsApp.

## 56. Security

- All inputs are validated server-side with zod. Client-side validation is for UX only.
- Prisma only; no string-built SQL. Where raw SQL is needed (full-text search), use tagged
  templates.
- Security headers: CSP (allowlisting the configured analytics and map hosts), HSTS,
  `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `frame-ancestors 'none'`.
- Secrets are never `NEXT_PUBLIC_`. `server-only` guards on server config and services.
- Uploads: type sniffing by magic bytes, size limits, randomised file names.
- Admin actions check roles server-side on every request and write to the audit log.

## 57. Environment variables

`.env.example` MUST list every variable below, grouped and commented. `.env` is git-ignored.

### 57.1 Required from phase 0

| Variable | Scope | Example |
|---|---|---|
| `DATABASE_URL` | server | `postgresql://realestate:realestate@localhost:5432/realestate?schema=public` |
| `NEXT_PUBLIC_SITE_URL` | public | `http://localhost:3000` |
| `NEXT_PUBLIC_BUSINESS_NAME` | public | `Demo Realty Jaipur` |
| `NEXT_PUBLIC_BUSINESS_PHONE` | public | `+91 90000 00000` (placeholder) |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | public | `hello@example.com` |
| `NEXT_PUBLIC_BUSINESS_ADDRESS_LINE1` | public | `Office No. 0, Demo Complex` |
| `NEXT_PUBLIC_BUSINESS_CITY` | public | `Jaipur` |
| `NEXT_PUBLIC_BUSINESS_STATE` | public | `Rajasthan` |
| `NEXT_PUBLIC_BUSINESS_PINCODE` | public | `302021` |

Example values are placeholders. They MUST be obviously fake (`example.com`, a `90000 00000`
number) and are replaced before launch.

### 57.2 Optional business and integration identity

`NEXT_PUBLIC_BUSINESS_LEGAL_NAME`, `NEXT_PUBLIC_BUSINESS_TAGLINE`,
`NEXT_PUBLIC_BUSINESS_PHONE_SECONDARY`, `NEXT_PUBLIC_BUSINESS_WHATSAPP`,
`NEXT_PUBLIC_BUSINESS_ADDRESS_LINE2`, `NEXT_PUBLIC_BUSINESS_LAT`, `NEXT_PUBLIC_BUSINESS_LNG`,
`NEXT_PUBLIC_BUSINESS_HOURS`, `NEXT_PUBLIC_RERA_AGENT_NUMBER`,
`NEXT_PUBLIC_SOCIAL_FACEBOOK`, `NEXT_PUBLIC_SOCIAL_INSTAGRAM`, `NEXT_PUBLIC_SOCIAL_YOUTUBE`,
`NEXT_PUBLIC_SOCIAL_LINKEDIN`, `NEXT_PUBLIC_SOCIAL_X`,
`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_META_PIXEL_ID`,
`NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`,
`NEXT_PUBLIC_ALLOW_INDEXING` (default `false`),
`NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT` (default `false`),
`NEXT_PUBLIC_MAP_PROVIDER` (`osm` | `google`, default `osm`),
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (browser key, referrer-restricted).

### 57.3 Server-only, used from later phases

| Variable | Phase | Purpose |
|---|---|---|
| `AUTH_SECRET` | auth | Session signing, ≥ 32 random bytes |
| `IP_HASH_SALT` | tracking | Salt for visitor hashing (§48) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | notifications | Email (§29) |
| `LEAD_NOTIFICATION_EMAIL` | notifications | Recipient(s), comma-separated |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | forms | Optional (§30) |
| `STORAGE_DRIVER` | uploads | `local` \| `s3` |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | uploads | S3-compatible storage (§36) |

## 58. Folder structure & conventions

```
app/
  (site)/            public pages (layout with header/footer)
  admin/             admin panel (own layout, auth-guarded)
  api/               route handlers
  layout.tsx, globals.css, sitemap.ts, robots.ts, not-found.tsx
components/
  ui/                design-system primitives (§40)
  layout/            header, footer, contact bar
  property/ project/ locality/ forms/ shared/
lib/
  config/            site config (§34): index.ts (public), server.ts (server-only)
  format/            price.ts, area.ts, phone.ts, date.ts, labels (§52–54)
  whatsapp.ts        link and message builders (§24)
  constants/         enum label maps, budget presets, area factors
  db.ts              Prisma client singleton
  seo/  analytics/  validation/  utils.ts
services/            data access and business logic (the ONLY layer that imports Prisma)
prisma/
  schema.prisma  migrations/  seed.ts  seed-data/
generated/prisma/    Prisma client output (git-ignored, rebuilt by `prisma generate`)
scripts/             create-admin, purge-demo, generate-placeholders
public/
  placeholders/      demo SVGs (§36)
docs/
  SPEC.md  ASSUMPTIONS.md  IMPLEMENTATION_PLAN.md
proxy.ts             optimistic admin auth redirect (Next.js 16 "proxy", formerly middleware)
instrumentation.ts   server env validation + error logging hook
prisma.config.ts     Prisma 7 config (datasource URL, migrations, seed command)
docker-compose.yml   optional local Postgres
.env.example
```

**Conventions**
- Pages and components call `services/*`. They never import the Prisma client directly.
- Services map DB rows to plain serialisable types (BigInt → number) before returning to
  components.
- Only `lib/config` reads `process.env` for business and integration values (§34).
- Path alias `@/*` points to the project root.
- File names are kebab-case. Components are PascalCase exports.
- No default exports except where Next.js requires them (pages, layouts, route files).

## 59. Quality gates

Before any phase is complete, all of these MUST pass with zero errors:
- `npm run lint`
- `npm run typecheck` (`tsc --noEmit`)
- `npm run build`
- Migrations apply cleanly to an empty database, and the seed runs twice without error
  (idempotency).

Unit tests (Vitest) SHOULD cover `lib/format` and `lib/whatsapp`, using the examples in §24,
§52 and §53 as test cases.

## 60. Deployment & operations

- Host on Vercel or a Node server (Docker). Use managed PostgreSQL (Neon, Supabase, RDS or
  similar) with daily backups and point-in-time recovery if available.
- Releases run `prisma migrate deploy`. Seeding is never run in production, except the
  non-demo reference data (city, localities, amenities) via an explicit flag.
- Environments: local, staging (`NEXT_PUBLIC_ALLOW_INDEXING=false`), production.
- Error logging via a hosted service (for example Sentry) SHOULD be added before launch.

## 61. Phased delivery plan

Adopted from the project owner's brief. Each phase ends with lint, type-check, fixes and a
check of the relevant pages (§59).

| Phase | Scope |
|---|---|
| 0 | Project initialisation and architecture: Next.js/TS/Tailwind, PostgreSQL + Prisma, site config (§34), formatting utilities (§24, §52–54), env and folder structure (§57, §58), docs |
| 1 | Core design system (§40), layout, navbar, footer, contact CTAs (§25), home page (§6) |
| 2 | Property database models and seed data (§10–13, §28, §35, §36, §42) and the services layer |
| 3 | Property search and filters (§7, §8), shortlist and compare (§16, §17) |
| 4 | Property detail pages (§9, §14, §15) |
| 5 | Jaipur locality and SEO landing pages (§11, `/buy/[locality]`, `/rent/[locality]`) |
| 6 | Project detail pages (§10) |
| 7 | Lead generation: enquiry, callback, call, WhatsApp, site-visit and owner-listing forms (§19, §24, §26–30) |
| 8 | Admin authentication and dashboard (§41, §43) |
| 9 | Property CRUD, image uploads and lead management (§36, §44, §45) |
| 10 | Blog and content management (§23, §46), about/contact/FAQ/legal pages, tools (§18, §20–22, §49) |
| 11 | Technical SEO, structured data, sitemap and robots.txt (§31–33) |
| 12 | Analytics (§47, §48), performance (§37), validation, security (§56), accessibility and responsive testing (§38, §39) |
| 13 | Production build and deployment preparation (§60) |

## 62. Open questions

1. Brand name, logo, colours and real business contact details.
2. Hosting choice (Vercel vs VPS) and the managed Postgres provider.
3. Which analytics tools are actually used (GA4, GTM, Meta Pixel, Clarity).
4. Whether PG / co-living rentals are in scope.
5. Current Rajasthan stamp duty and registration rates for the tools page.
6. Whether agents need their own logins in v1.
7. Map provider preference (OpenStreetMap vs Google Maps).
8. Whether analytics consent should be required by default.
