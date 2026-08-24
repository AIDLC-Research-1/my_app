# syntax=docker/dockerfile:1

# --- Stage 1: install production dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Stage 2: runtime image ---
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy production dependencies and application source
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY index.js ./

# Run as the built-in non-root user for better security
USER node

# Port the app listens on (overridable via PORT env var)
ENV PORT=3000
EXPOSE ${PORT}

CMD ["node", "index.js"]
