# ----------- BUILDER STAGE -----------
FROM node:20-slim AS builder

WORKDIR /app

# Install deps (including dev deps for build)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build app
RUN npm run build


# ----------- RUNTIME STAGE -----------
FROM node:20-slim

WORKDIR /app

# Install only required system dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-freefont-ttf \
    libnss3 \
    libfreetype6 \
    libharfbuzz0b \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Environment for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    TZ=Asia/Jakarta \
    PORT=3000 \
    HOST=0.0.0.0

# Copy only necessary files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/drizzle ./drizzle

# Install only production deps
RUN npm ci --omit=dev

# Create uploads dir (will be writable as root at runtime)
RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate && node build/index.js"]