# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY server/ ./server/
COPY client/ ./client/

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build server
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

# Build client
WORKDIR /app/client
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files and install production dependencies
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY server/package*.json ./server/

RUN npm ci --omit=dev --workspace=@fusemapper/server --workspace=@fusemapper/shared

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/client/dist ./client/dist

# Generate Prisma client in production
WORKDIR /app/server
RUN npx prisma generate

# Create data directory
RUN mkdir -p /app/server/data

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/app/server/data/fusemapper.db"

# Initialize database on startup
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
