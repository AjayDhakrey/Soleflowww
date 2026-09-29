# Multi-stage Dockerfile for SoleFlow Full Stack Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy full application codebase
COPY . .

# Build Vite frontend assets
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and backend codebase
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend ./backend

EXPOSE 3001

CMD ["node", "backend/server.js"]
