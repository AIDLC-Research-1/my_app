# syntax=docker/dockerfile:1

FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install dependencies first to leverage Docker layer caching.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source.
COPY . .

# Persist todo data outside the image.
VOLUME ["/usr/src/app/data"]

EXPOSE 3000

# Run as the built-in unprivileged user.
USER node

CMD ["node", "index.js"]
