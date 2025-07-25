# Base image
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Development stage
FROM base AS development

ENV NODE_ENV=development
ENV PORT=3000

COPY . .
COPY --from=base /app/node_modules ./node_modules

EXPOSE $PORT
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=base /app/node_modules ./node_modules
COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE $PORT

CMD ["npm", "start"]
