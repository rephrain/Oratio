# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/static ./static
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/src ./src
RUN mkdir -p /app/uploads
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build/index.js"]