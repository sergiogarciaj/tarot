# Stage 1: Build the application
FROM node:20-slim AS builder
WORKDIR /app

COPY . .
RUN npm install && npm run build

# Stage 2: Production runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4025
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 4025

CMD ["node", "server.js"]
