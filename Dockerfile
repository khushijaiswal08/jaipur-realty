# syntax=docker/dockerfile:1.7
# Production image: Next.js standalone server (see docs/DEPLOYMENT.md).
#
#   deps     full npm install (dev deps are needed to build and for the Prisma CLI)
#   tools    migrations, seed, admin:create, purge-demo  →  docker compose run --rm tools …
#   builder  next build (pre-renders pages from the database)
#   runner   minimal runtime image, non-root, ~200 MB

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# The Prisma CLI's schema engine needs OpenSSL.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# prisma.config.ts requires DATABASE_URL to be set; `prisma generate` (postinstall) never connects.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npm ci

# ── tools ─────────────────────────────────────────────────────────────────────
FROM deps AS tools
COPY . .
CMD ["npx", "prisma", "migrate", "deploy"]

# ── builder ───────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY . .
ENV NEXT_OUTPUT=standalone
# The build validates the business config and pre-renders listing pages from the database,
# so it needs the full environment. `.env` is mounted as a build secret (never stored in a
# layer) and the copy Next.js places in the standalone output is removed in the same step.
RUN --mount=type=secret,id=dotenv,target=/app/.env,required=true \
    npm run build \
 && rm -f .next/standalone/.env .next/standalone/.env.*

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --no-create-home nextjs \
 && mkdir -p /app/storage/uploads \
 && chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# sharp loads libvips from @img/* at runtime; copy the whole scope so no shared library is
# missed by output tracing.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@img ./node_modules/@img

USER nextjs
EXPOSE 3000
# Local uploads (STORAGE_DRIVER=local). Mount a volume here.
VOLUME ["/app/storage"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
