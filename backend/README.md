# SinShell Backend

Backend API для SinShell - терминального стилизованного веб-сайта.

## 🚀 Quick Start

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск в production режиме
npm start

# Сборка проекта
npm run build
```

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск конкретного тестового файла
npm test -- basic.test.ts

# Запуск тестов в режиме watch
npm run test:watch

# Запуск тестов с покрытием кода
npm run test:coverage
```

## 📁 Структура проекта

```
backend/
├── src/
│   ├── config/           # Конфигурация приложения
│   ├── controllers/      # Контроллеры API
│   ├── middleware/       # Middleware (логирование, обработка ошибок)
│   ├── routes/          # Маршруты API
│   ├── types/           # TypeScript типы
│   ├── tests/           # Тесты
│   ├── app.ts           # Express приложение
│   └── index.ts         # Точка входа
├── jest.config.js       # Конфигурация Jest
├── tsconfig.json        # Конфигурация TypeScript
├── .env.example         # Пример переменных окружения
└── package.json         # Зависимости и скрипты
```

## 🔗 API Endpoints

### Health Check
- `GET /health` - Базовый health check
- `GET /api/v1/health` - API health check
- `GET /api/v1/health/detailed` - Детальная информация
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/live` - Liveness probe

### System Info
- `GET /api/v1/info` - Информация о системе
- `GET /api/v1/info/api` - Информация об API
- `GET /api/v1/info/server` - Статус сервера

### About
- `GET /api/v1/about` - Базовая информация о проекте
- `GET /api/v1/about/extended` - Расширенная информация
- `GET /api/v1/about/license` - Информация о лицензии

## 🛠️ Технологии

- **Node.js** - Runtime среда
- **Express.js** - Web фреймворк
- **TypeScript** - Типизация JavaScript
- **Jest** - Фреймворк для тестирования
- **Supertest** - HTTP assertions для тестирования
- **Helmet** - Security middleware
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logger
- **Compression** - Gzip compression

## 🔧 Конфигурация

Переменные окружения (см. `.env.example`):

```bash
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## 📊 Тесты

Проект включает комплексные автотесты:

- **Unit тесты** для всех API endpoints
- **Интеграционные тесты** для проверки взаимодействия компонентов
- **Тесты безопасности** для проверки CORS headers и security headers
- **Тесты производительности** для проверки времени ответа

### Покрытие тестами

- ✅ Health endpoints (5 тестов)
- ✅ Info endpoints (3 теста) 
- ✅ About endpoints (3 теста)
- ✅ Интеграционные тесты (6 тестов)
- ✅ Обработка ошибок (404, 500)

## 🚦 Статус разработки

- ✅ Backend архитектура
- ✅ API endpoints
- ✅ Middleware
- ✅ Логирование
- ✅ Обработка ошибок
- ✅ Автотесты
- ✅ TypeScript типизация
- ✅ Security headers
- ✅ CORS настройка

## 📝 Лицензия

MIT License - см. файл LICENSE в корне проекта.