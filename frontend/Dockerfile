# Multi-stage build для оптимизации размера образа
FROM node:20-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Установка рабочей директории
WORKDIR /app

# Создание non-root пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копирование собранного приложения из builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Переключение на non-root пользователя
USER nextjs

# Открытие порта
EXPOSE 80

# Переменные окружения
ENV PORT 80
ENV HOSTNAME "0.0.0.0"

# Запуск приложения
CMD ["node", "server.js"]