FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# pg_dump for the daily backup job (same major version as the postgres service)
RUN apk add --no-cache postgresql16-client

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next
# Volumes mounted here start with this ownership, so the app can write uploads and backups
RUN mkdir -p uploads backups && chown nextjs:nodejs uploads backups

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Base schema and SQL migrations, applied by src/lib/migrate.ts when the server starts
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/migrations ./migrations
# Maintenance scripts (e.g. set-admin-password.js) run with the traced node_modules
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
# bcryptjs is bundled into the server build, so the script needs its own copy
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
