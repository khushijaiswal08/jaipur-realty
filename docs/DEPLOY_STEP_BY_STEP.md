# Deploy step by step (beginner guide)

Puts the site online with a link anyone can open on their phone. Everything is done in web
dashboards plus a few commands in the terminal on this computer.

| Service | What it does | Cost |
|---|---|---|
| **GitHub** | Stores the code privately | Free |
| **Neon** | The database (listings, leads, admin logins) | Free plan to start |
| **Cloudflare R2** | Stores property photos you upload in the admin panel | Free up to 10 GB |
| **Vercel** | Runs the website | Free "Hobby" plan for testing; **Pro (US$20/month) once it is a live business site** — Vercel's free plan is for non-commercial use only |
| Domain (optional) | e.g. `yourname.in` | ~₹700–1,200 per year |

Keep a notepad open: you will copy a few values from one site into another. Treat them like
passwords and never post them anywhere public.

---

## Step 1 — Put the code on GitHub (10 min)

1. Go to <https://github.com>, sign up (or log in).
2. Click **+** (top right) → **New repository**.
   - Name: `jaipur-realty` · Visibility: **Private** · leave every other box unticked.
   - Click **Create repository**.
3. In the terminal on this computer (inside the project folder) run the two commands below,
   replacing `YOUR-USERNAME`:

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/jaipur-realty.git
   ```

   ```bash
   git push -u origin main
   ```

   A browser window may ask you to log in to GitHub — approve it.
4. Refresh the GitHub page: you should see the project files. Your `.env` file (with passwords
   and your phone number) is deliberately **not** uploaded.

## Step 2 — Create the database on Neon (5 min)

1. Go to <https://neon.tech>, sign up (you can use "Continue with GitHub").
2. Create a project: name `jaipur-realty`, Postgres version 17, region **closest to India**
   (Singapore, or Mumbai if it is listed).
3. On the project dashboard click **Connect**. Turn **Connection pooling off**, and copy the
   connection string. It looks like
   `postgresql://neondb_owner:xxxx@ep-something.region.aws.neon.tech/neondb?sslmode=require`
4. Paste it into your notepad as **DATABASE_URL**.

## Step 3 — Fill the new database (5 min)

In the terminal on this computer (PowerShell), run these one by one. The first line points
the commands at Neon **for this terminal window only** (paste your own connection string):

```bash
$env:DATABASE_URL="PASTE-YOUR-NEON-CONNECTION-STRING-HERE"
```

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

```bash
npm run admin:create
```

- `migrate deploy` creates the tables.
- `db:seed` adds the clearly-labelled demo listings (skip it if you don't want demo content).
- `admin:create` asks for **your** email, name and a strong password — this is your real admin
  login for the live site. (The local test account does not exist on the live database.)

Close this terminal window afterwards so later commands go back to your local database.

## Step 4 — Photo storage on Cloudflare R2 (10 min)

Vercel has no permanent disk, so uploaded photos go to R2.

1. Go to <https://dash.cloudflare.com>, sign up, and open **R2 Object Storage** in the left menu
   (you may need to add a payment method; the free allowance covers a normal site).
2. **Create bucket** → name `jaipur-realty-uploads` → Create.
3. Open the bucket → **Settings** → **Public access** → under **R2.dev subdomain** click
   **Allow Access**. Copy the public URL (like `https://pub-xxxx.r2.dev`) → notepad as
   **S3_PUBLIC_URL**.
4. Back on the R2 overview page, copy your **Account ID** (right side).
5. **Manage API tokens** → **Create API token** → permission **Object Read & Write**, apply to
   the bucket above → Create. Copy **Access Key ID** and **Secret Access Key** into the notepad
   (the secret is shown only once).

## Step 5 — Prepare the website settings (10 min)

Make a copy of your `.env` in the notepad and change these lines (everything else, including
your phone, WhatsApp and email, stays as it is):

```bash
DATABASE_URL="(the Neon string from step 2)"
NEXT_PUBLIC_SITE_URL="https://jaipur-realty.vercel.app"
NEXT_PUBLIC_ALLOW_INDEXING="false"
AUTH_SECRET="(new random value, see below)"
IP_HASH_SALT="(another new random value)"
STORAGE_DRIVER="s3"
S3_ENDPOINT="https://YOUR-ACCOUNT-ID.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="jaipur-realty-uploads"
S3_ACCESS_KEY_ID="(from step 4)"
S3_SECRET_ACCESS_KEY="(from step 4)"
S3_PUBLIC_URL="https://pub-xxxx.r2.dev"
TRUSTED_PROXY_COUNT="1"
```

Delete the `ADMIN_DEV_EMAIL` / `ADMIN_DEV_PASSWORD` lines — they are only for local testing.

Make the two random values by running this command twice and copying each result:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

`NEXT_PUBLIC_SITE_URL` is a guess for now — you will correct it in step 7.

## Step 6 — Deploy on Vercel (10 min)

1. Go to <https://vercel.com>, **Sign up with GitHub**.
2. **Add New… → Project** → pick `jaipur-realty` → **Import**.
3. Framework: **Next.js** (detected automatically).
4. Open **Build and Output Settings**, turn on the override for **Build Command** and enter:

   ```
   npx prisma migrate deploy && npm run build
   ```

5. Open **Environment Variables**: click in the first *Key* box and paste your whole notepad
   `.env` from step 5 — Vercel splits it into separate variables automatically. Check they
   appear, then click **Deploy**.
6. Wait 2–4 minutes. When you see confetti, click the preview to open your site. The address is
   shown at the top (e.g. `https://jaipur-realty-abc123.vercel.app`).

## Step 7 — Fix the site address and redeploy (3 min)

1. Copy the real address from step 6.
2. Vercel → your project → **Settings → Environment Variables** → edit
   `NEXT_PUBLIC_SITE_URL` to that exact address (no slash at the end) → Save.
3. **Deployments** tab → the ⋯ menu on the latest one → **Redeploy**.
   (Anything starting with `NEXT_PUBLIC_` needs a redeploy to take effect.)

## Step 8 — Check it (5 min)

On your phone, open the address and check:

- [ ] The home page loads; the header shows your number.
- [ ] **Call** dials your number, **WhatsApp** opens a chat with your number.
- [ ] `/admin/login` → sign in with the account from step 3.
- [ ] Add a test photo to a listing in the admin panel — it should appear on the site.
- [ ] Submit the contact form once → it appears in **Admin → Leads**.
- [ ] `https://your-address/api/health` shows `"status":"ok"`.

Now you can send the link to anyone.

---

## Later — optional but recommended

**Your own domain** (e.g. `yourname.in`)
1. Buy it (GoDaddy, Hostinger, Cloudflare, …).
2. Vercel → project → **Settings → Domains** → add it and copy the DNS records Vercel shows into
   your domain provider's DNS page. HTTPS is set up automatically.
3. Change `NEXT_PUBLIC_SITE_URL` to `https://yourname.in` and redeploy.

**Lead emails to your Gmail**
1. Turn on 2-Step Verification in your Google account, then create an **App password**
   (Google Account → Security → App passwords).
2. Add in Vercel and redeploy:
   `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=your Gmail`,
   `SMTP_PASSWORD=the 16-letter app password`, `SMTP_FROM=Your Business <your Gmail>`.

**Going public on Google** — only when the real business name, address, listings and legal
pages are ready (see `docs/LAUNCH_CHECKLIST.md`): set `NEXT_PUBLIC_ALLOW_INDEXING="true"`,
redeploy, and upgrade Vercel to Pro.

**Updating the site later** — after code changes, run `git push` (the Code tab can do this for
you). Vercel rebuilds and publishes automatically in a few minutes. Listings, photos and
leads are edited in the admin panel and appear immediately, no redeploy needed.

## If something goes wrong

| Symptom | Fix |
|---|---|
| Build fails with "Invalid … environment variables" (the log names the variable) | That variable is missing or misspelt in Vercel → compare with `.env.example`. |
| Log says "STORAGE_DRIVER=s3 requires: …" | One of the `S3_*` values from step 5 wasn't added. |
| Build fails at `prisma migrate deploy` | `DATABASE_URL` is wrong, or pooling was on — copy it again from Neon with pooling off. |
| Site loads but Call/WhatsApp show the old number | You changed a `NEXT_PUBLIC_` value without redeploying. |
| Photo upload fails in admin | Re-check the five `S3_*` values and that the R2 token has Read & Write. |
| Can't log in to admin | Run step 3's `admin:create` again (same email resets the password). |
