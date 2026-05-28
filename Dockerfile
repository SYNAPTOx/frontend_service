# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "run", "start"]
