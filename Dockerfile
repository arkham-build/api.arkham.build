# Migrations
FROM amacneil/dbmate:2 AS dbmate

# Base image
FROM node:22-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
COPY .kysely*.json ./
RUN npm ci

# Development stage
FROM base AS development

ENV NODE_ENV=development
ENV PORT=3000

COPY --from=base /app .

EXPOSE $PORT
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=base --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY . .

COPY --from=dbmate /usr/local/bin/dbmate /usr/local/bin/dbmate

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN npm prune --omit dev
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE $PORT
CMD ["npm", "start"]
