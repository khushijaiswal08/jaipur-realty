# Launch Checklist

Work through this before pointing the real domain at the site. Items marked **(blocker)**
must be done. Deployment steps are in [DEPLOYMENT.md](DEPLOYMENT.md); every placeholder is
listed in [ASSUMPTIONS.md](ASSUMPTIONS.md).

## 1. Business identity (`.env`, then rebuild)

- [ ] **(blocker)** Business name, phone, WhatsApp number, email and office address
      (`NEXT_PUBLIC_BUSINESS_*`). Nothing else in the code needs editing.
- [ ] **(blocker)** Tap-test the WhatsApp and call buttons on a phone: they must open the
      right number with the pre-filled message.
- [ ] Office coordinates (`NEXT_PUBLIC_BUSINESS_LAT` / `_LNG`) and opening hours.
- [ ] Logo (`NEXT_PUBLIC_BUSINESS_LOGO_URL`). Favicon and share images are generated from the
      business name automatically.
- [ ] Rajasthan RERA agent registration number (`NEXT_PUBLIC_RERA_AGENT_NUMBER`), only if you
      have a real one.
- [ ] Social profile URLs (hidden while empty).
- [ ] Maps: keep OpenStreetMap, or set `NEXT_PUBLIC_MAP_PROVIDER=google` with a
      domain-restricted `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

## 2. Content

- [ ] **(blocker)** Add real listings in **Admin → Properties / Projects**, then remove all demo
      content with `npm run db:purge-demo`. Demo items show a "Demo" badge and are `noindex`.
- [ ] **(blocker)** Replace demo testimonials with real ones, or leave the section empty.
      Never publish invented reviews.
- [ ] Home hero, "Why us" and About page copy: `lib/constants/marketing.ts`.
- [ ] Locality guides: check the descriptions and price ranges (Admin → Localities).
- [ ] Blog: replace or edit the demo posts, and add real FAQs (Admin → FAQs).
- [ ] Stamp-duty calculator: confirm the rates in `lib/constants/tools.ts`, then set
      `verified: true` and `effectiveFrom`.

## 3. Legal

- [ ] **(blocker)** Have a lawyer review Privacy Policy, Terms and Disclaimer (DPDP Act 2023,
      RERA advertising rules). Then set `LEGAL_REVIEWED = true` in
      `components/shared/legal-page.tsx` to remove the "draft" notice.
- [ ] Decide on analytics consent (`NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT`) and make the privacy
      policy match what is actually collected.

## 4. Accounts and security

- [ ] **(blocker)** Fresh `AUTH_SECRET` and `IP_HASH_SALT` for production. Never reuse the
      development ones.
- [ ] **(blocker)** Create real admin accounts with `npm run admin:create` (strong, unique
      passwords). Start with an empty production database, not a copy of the development one,
      which contains test accounts.
- [ ] Give staff the least role they need (Editor / Admin / Super admin).
- [ ] Spam protection: Cloudflare Turnstile keys (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
      `TURNSTILE_SECRET_KEY`).
- [ ] Port 3000 and PostgreSQL aren't reachable from the internet (firewall: allow 22, 80, 443).
- [ ] `TRUSTED_PROXY_COUNT` matches your proxy setup (DEPLOYMENT.md §7).

## 5. Leads

- [ ] **(blocker)** SMTP configured and `LEAD_NOTIFICATION_EMAIL` set. Submit each form once
      (property enquiry, site visit, contact, post-property) and confirm the email arrives and the
      lead appears in **Admin → Leads**.
- [ ] Agent contact details (Admin → Agents) are real, or the demo agent is removed.
- [ ] Agree who answers WhatsApp and calls, and how fast.

## 6. SEO

- [ ] **(blocker)** `NEXT_PUBLIC_SITE_URL` is the final `https://` domain and
      `NEXT_PUBLIC_ALLOW_INDEXING=true`. Rebuild after changing either.
- [ ] Check `https://your-domain/robots.txt` and `/sitemap.xml`.
- [ ] Google Search Console: verify (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`), then submit the
      sitemap. Do the same in Bing Webmaster Tools.
- [ ] Create or claim the Google Business Profile with the same name, address and phone as the site.
- [ ] Spot-check a listing with Google's Rich Results Test.

## 7. Analytics

- [ ] GA4 / GTM / Meta Pixel / Clarity IDs set as needed (scripts load only when set).
- [ ] In GA4 DebugView, confirm `page_view`, `search`, `property_view`, `whatsapp_click`,
      `call_click` and `enquiry_submit`. Mark leads as key events (conversions).

## 8. Operations

- [ ] HTTPS works, and `www` redirects to the main domain (or the other way round).
- [ ] Photo upload works and the photo survives a restart or redeploy (persistent disk / volume / S3).
- [ ] Nightly database **and** uploads backups, copied off the server; one restore tested.
- [ ] Uptime monitor on `https://your-domain/api/health`.
- [ ] Lighthouse (mobile) on home, a listing page and a property page: aim for ≥ 90 on
      Performance, Accessibility, Best Practices and SEO.
- [ ] Final quality gates on the release commit: `npm run check && npm run build`.
