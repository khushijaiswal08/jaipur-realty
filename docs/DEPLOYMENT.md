# Deployment Guide

How to run the site in production. Before going live, work through
[LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

**New to this?** Follow [DEPLOY_STEP_BY_STEP.md](DEPLOY_STEP_BY_STEP.md): GitHub + Vercel +
Neon + Cloudflare R2, all through web dashboards.

## 1. What production needs

| Need | Notes |
|---|---|
| Node.js ≥ 20.19 (24 LTS recommended) | Not needed on the host with the Docker option. |
| PostgreSQL ≥ 15 | Self-hosted, or managed (Neon, Supabase, RDS, DigitalOcean, …). |
| Persistent disk **or** S3-compatible bucket | For admin photo uploads (`STORAGE_DRIVER=local` or `s3`). |
| A domain + HTTPS | Caddy (automatic Let's Encrypt) or Nginx + Certbot. |
| SMTP account | For new-lead emails. Without it, leads are still saved and logged. |

A small VPS (2 vCPU / 2–4 GB RAM) is plenty for launch traffic.

## 2. Two things that surprise people

1. **`NEXT_PUBLIC_*` values are baked in at build time.** Changing the business name, phone,
   site URL or analytics IDs means rebuilding, not just restarting.
2. **The build talks to the database.** `next build` pre-renders listing, locality, project
   and blog pages from PostgreSQL. After that they refresh every 5 minutes (other pages
   hourly), or immediately after an admin edit. So the order is always: **migrate → build → start**, and the build machine
   must reach the database.

## 3. Production environment

Start from `.env.example`. On top of the business details, production needs:

```bash
NEXT_PUBLIC_SITE_URL="https://example.com"   # final https URL, no trailing slash
NEXT_PUBLIC_ALLOW_INDEXING="true"            # anything else = noindex everywhere
AUTH_SECRET="…"                              # unique per environment, ≥ 32 chars
IP_HASH_SALT="…"
TRUSTED_PROXY_COUNT="1"                      # proxies in front of the app (see §7)
```

Generate each secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Don't use `$` in `.env` values when using Docker Compose (Compose treats it as a variable).
Never commit `.env`; it is git-ignored and excluded from Docker builds.

## 4. Option A — Node.js on a VPS (Ubuntu 24.04)

```bash
# 1. System packages
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql caddy git

# 2. Database
sudo -u postgres psql -c "CREATE ROLE realestate LOGIN PASSWORD 'change-me';"
sudo -u postgres psql -c "CREATE DATABASE realestate OWNER realestate;"

# 3. App (as a non-root user, e.g. /srv/jaipur-realty)
git clone <your-repo-url> /srv/jaipur-realty && cd /srv/jaipur-realty
cp .env.example .env && nano .env          # production values (§3)
npm ci
npm run db:deploy                           # apply migrations
npm run admin:create                        # first admin login
npm run db:seed                             # optional: demo content until real listings exist
npm run build
```

Run it with systemd (`/etc/systemd/system/jaipur-realty.service`):

```ini
[Unit]
Description=Jaipur Realty (Next.js)
After=network.target postgresql.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/srv/jaipur-realty
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start -- -H 127.0.0.1 -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now jaipur-realty
```

Caddy (`/etc/caddy/Caddyfile`) gives you HTTPS automatically:

```
example.com {
	encode zstd gzip
	reverse_proxy 127.0.0.1:3000
}
www.example.com {
	redir https://example.com{uri} permanent
}
```

Uploads land in `/srv/jaipur-realty/storage/uploads`. Include that folder in backups (§8).

**Updating:**

```bash
cd /srv/jaipur-realty && git pull
npm ci && npm run db:deploy && npm run build
sudo systemctl restart jaipur-realty
```

<details>
<summary>Using Nginx instead of Caddy</summary>

```nginx
server {
    server_name example.com;
    client_max_body_size 20m;           # photo uploads
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # listen 443 ssl; … (managed by Certbot: sudo certbot --nginx -d example.com -d www.example.com)
}
```
</details>

## 5. Option B — Docker Compose (single VPS)

`docker-compose.prod.yml` runs PostgreSQL, the app (standalone Next.js image, non-root,
with a health check) and Caddy for HTTPS. Uploads and the database live in named volumes.

In `.env`, in addition to §3:

```bash
POSTGRES_PASSWORD="a-long-random-password"
DATABASE_URL="postgresql://realestate:a-long-random-password@db:5432/realestate?schema=public"
DOMAIN="example.com"
```

First deploy:

```bash
docker compose -f docker-compose.prod.yml up -d db
docker compose -f docker-compose.prod.yml run --rm tools npx prisma migrate deploy
docker compose -f docker-compose.prod.yml run --rm tools npm run admin:create
docker compose -f docker-compose.prod.yml run --rm tools npm run db:seed   # optional demo content
docker compose -f docker-compose.prod.yml build app
docker compose -f docker-compose.prod.yml up -d
```

Why the order matters: building `app` pre-renders pages from the database. The build
reaches Postgres through the loopback-only port `127.0.0.1:5432`, and `.env` is passed as a
BuildKit secret, so it never ends up in an image layer.

Updating:

```bash
git pull
docker compose -f docker-compose.prod.yml build tools app
docker compose -f docker-compose.prod.yml run --rm tools npx prisma migrate deploy
docker compose -f docker-compose.prod.yml up -d app
```

Other one-off tasks use the same `tools` service, e.g.
`docker compose -f docker-compose.prod.yml run --rm tools npm run db:purge-demo`.

> The Dockerfile was written for this project but could not be test-built on the development
> machine (no Docker there). The standalone server it packages was tested locally (pages,
> redirects, 404s, uploads, image optimisation, admin sign-in, `/api/health`). Run the
> first Docker build on a staging server.

## 6. Option C — Vercel or another managed platform

- Use a managed Postgres (Neon, Supabase…) that the build can reach, and set every variable
  from §3 in the platform's environment settings.
- Set the build command to `npx prisma migrate deploy && npm run build`.
- Serverless functions have no persistent disk: set `STORAGE_DRIVER=s3` (Cloudflare R2, S3,
  DigitalOcean Spaces…) with `S3_*` values.
- Rate limits and view de-duplication are in memory per instance, so they are weaker on
  serverless. Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`) is
  recommended there.
- Local `db:seed` / `admin:create` can target the production DB by running them from your machine
  with that `DATABASE_URL`.

## 7. Reverse proxies and client IPs

Rate limits and view counts use the client IP from `X-Forwarded-For`. Only the right-most
entries, added by your own proxies, are trusted. Set `TRUSTED_PROXY_COUNT` to the number of
proxies in front of the app:

| Setup | Value |
|---|---|
| Caddy or Nginx → app | `1` (default) |
| Cloudflare (proxied DNS) → Nginx with `$proxy_add_x_forwarded_for` → app | `2` |
| Cloudflare → Caddy → app | `2`, and list [Cloudflare's IP ranges](https://www.cloudflare.com/ips/) under Caddy's `trusted_proxies`. Otherwise Caddy replaces the header with Cloudflare's address. |
| Vercel | `1` |

Never expose port 3000 directly to the internet.

## 8. Backups

Back up **both** the database and the uploads (when `STORAGE_DRIVER=local`).

```bash
# Nightly (cron), keep 14 days
pg_dump "$DATABASE_URL" -Fc -f /backups/realestate-$(date +%F).dump
find /backups -name 'realestate-*.dump' -mtime +14 -delete
tar -czf /backups/uploads-$(date +%F).tar.gz -C /srv/jaipur-realty storage/uploads
```

With Docker: `docker compose -f docker-compose.prod.yml exec -T db pg_dump -U realestate -Fc realestate > backup.dump`
and back up the `uploads` volume.

Restore: `pg_restore --clean --no-owner -d "$DATABASE_URL" backup.dump`. Test a restore once
before launch, and copy backups off the server.

## 9. Monitoring and operations

- **Health:** `GET /api/health` → `200 {"status":"ok"}` or `503` when the database is
  unreachable. Point an uptime monitor at it (UptimeRobot, Better Stack…).
- **Logs:** request errors are logged by `instrumentation.ts`. With systemd use
  `journalctl -u jaipur-realty -f`; with Docker, `docker compose logs -f app`.
- **Leads without SMTP** are still saved in the admin panel and printed to the log.
- **Migrations** only move forward. Take a backup before `db:deploy` on every release.
- **Content edits** in the admin panel refresh public pages immediately (on-demand
  revalidation). Changes made straight in the database appear within 5 minutes on listing
  pages and within an hour elsewhere.
