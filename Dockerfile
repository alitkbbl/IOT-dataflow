# --- مرحله build ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build  # خروجی در dist ✅

# --- مرحله اجرا (runtime) ---
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY .env .env

# 👇 این خط را اضافه کن
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/server.js"]
