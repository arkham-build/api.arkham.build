# Migrations
FROM amacneil/dbmate:2 AS dbmate

# Base image
FROM node:22-alpine AS base

# Dependencies stage
FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production && \
    npm cache clean --force

# Development stage
FROM base AS development

WORKDIR /app

ENV NODE_ENV=development
ENV PORT=3000

COPY src ./src
COPY package.json package-lock.json ./
COPY .kysely*.json ./

RUN npm ci

EXPOSE $PORT
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

COPY --from=dbmate /usr/local/bin/dbmate /usr/local/bin/dbmate

RUN rm -rf /var/cache/apk/* && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE $PORT
CMD ["npm", "start"]
