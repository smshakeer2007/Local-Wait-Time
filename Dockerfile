# Multi-stage Docker build for LocalWait Times
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --prefix server
RUN npm install --prefix client

# Copy source files
COPY server/ ./server/
COPY client/ ./client/

# Build client SPA
RUN npm run build --prefix client

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/node_modules ./server/node_modules

EXPOSE 5000

CMD ["node", "server/src/index.js"]
