# ═══════════════════════════════════════════════════════════
# CyberShield Academy — Production Dockerfile
# Multi-stage build for minimal image size
# ═══════════════════════════════════════════════════════════

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++ 
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production && cp -R node_modules prod_node_modules
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files and database
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/prod_node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=deps /app/prod_node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/prod_node_modules/.prisma ./node_modules/.prisma

# Create data directory with proper permissions
RUN mkdir -p prisma/data && chown -R nextjs:nodejs prisma/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
