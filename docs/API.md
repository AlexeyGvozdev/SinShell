# API Документация SinShell

## Базовая информация

**Base URL**: `http://localhost:5000/api`  
**Content-Type**: `application/json`  
**Версия API**: `v1`

## Endpoints

### 1. Health Check

Проверка работоспособности сервера.

**Endpoint**: `GET /api/health`

**Описание**: Возвращает статус работы сервера и текущее время.

**Параметры**: Нет

**Пример запроса**:
```bash
curl http://localhost:5000/api/health
```

**Пример ответа**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T21:58:00.000Z"
}
```

**Коды ответа**:
- `200 OK` - Сервер работает нормально

---

### 2. System Info

Получение информации о системе.

**Endpoint**: `GET /api/info`

**Описание**: Возвращает информацию о приложении, версии и времени работы.

**Параметры**: Нет

**Пример запроса**:
```bash
curl http://localhost:5000/api/info
```

**Пример ответа**:
```json
{
  "name": "SinShell API",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": "development",
  "nodeVersion": "18.17.0"
}
```

**Поля ответа**:
- `name` (string) - Название приложения
- `version` (string) - Версия приложения
- `uptime` (number) - Время работы сервера в секундах
- `environment` (string) - Окружение (development/production)
- `nodeVersion` (string) - Версия Node.js

**Коды ответа**:
- `200 OK` - Успешный запрос

---

### 3. About

Получение информации о сайте.

**Endpoint**: `GET /api/about`

**Описание**: Возвращает информацию о сайте, авторе и ссылки.

**Параметры**: Нет

**Пример запроса**:
```bash
curl http://localhost:5000/api/about
```

**Пример ответа**:
```json
{
  "title": "SinShell",
  "description": "Terminal styled website built with Next.js and Express",
  "author": "Your Name",
  "version": "1.0.0",
  "links": [
    {
      "name": "GitHub",
      "url": "https://github.com/yourusername/sinshell",
      "icon": "github"
    },
    {
      "name": "Portfolio",
      "url": "https://yourportfolio.com",
      "icon": "globe"
    }
  ],
  "technologies": [
    "Next.js",
    "TypeScript",
    "Express.js",
    "Tailwind CSS"
  ]
}
```

**Поля ответа**:
- `title` (string) - Название проекта
- `description` (string) - Описание проекта
- `author` (string) - Автор проекта
- `version` (string) - Версия проекта
- `links` (array) - Массив ссылок
  - `name` (string) - Название ссылки
  - `url` (string) - URL ссылки
  - `icon` (string) - Иконка для ссылки
- `technologies` (array) - Используемые технологии

**Коды ответа**:
- `200 OK` - Успешный запрос

---

## Будущие Endpoints

### 4. Projects (Планируется)

**Endpoint**: `GET /api/projects`

**Описание**: Получение списка проектов.

**Пример ответа**:
```json
{
  "projects": [
    {
      "id": "1",
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["React", "Node.js"],
      "url": "https://project-url.com",
      "github": "https://github.com/user/project"
    }
  ]
}
```

---

### 5. Contact (Планируется)

**Endpoint**: `GET /api/contact`

**Описание**: Получение контактной информации.

**Пример ответа**:
```json
{
  "email": "your.email@example.com",
  "social": {
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername",
    "twitter": "https://twitter.com/yourusername"
  }
}
```

---

### 6. Submit Message (Планируется)

**Endpoint**: `POST /api/contact/message`

**Описание**: Отправка сообщения через контактную форму.

**Тело запроса**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about your project",
  "message": "Hello, I have a question..."
}
```

**Пример ответа**:
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

## Обработка ошибок

Все endpoints возвращают ошибки в следующем формате:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Коды ошибок

| Код | Описание |
|-----|----------|
| `400` | Bad Request - Неверные параметры запроса |
| `404` | Not Found - Ресурс не найден |
| `500` | Internal Server Error - Внутренняя ошибка сервера |
| `503` | Service Unavailable - Сервис временно недоступен |

**Пример ошибки**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found",
    "details": "Endpoint /api/unknown does not exist"
  }
}
```

---

## Rate Limiting

API использует rate limiting для защиты от злоупотреблений:

- **Лимит**: 100 запросов в минуту на IP адрес
- **Заголовки ответа**:
  - `X-RateLimit-Limit`: Максимальное количество запросов
  - `X-RateLimit-Remaining`: Оставшееся количество запросов
  - `X-RateLimit-Reset`: Время сброса лимита (Unix timestamp)

**Пример превышения лимита**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retryAfter": 60
  }
}
```

---

## CORS

API настроен для работы с CORS:

- **Разрешенные origins**: `http://localhost:3000` (development)
- **Разрешенные методы**: `GET, POST, PUT, DELETE, OPTIONS`
- **Разрешенные заголовки**: `Content-Type, Authorization`

---

## Аутентификация (Будущее)

В будущих версиях API будет поддерживать аутентификацию через JWT токены:

**Получение токена**:
```bash
POST /api/auth/login
{
  "username": "user",
  "password": "password"
}
```

**Использование токена**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/protected
```

---

## Примеры использования

### JavaScript (Fetch API)

```javascript
// Health check
const checkHealth = async () => {
  const response = await fetch('http://localhost:5000/api/health');
  const data = await response.json();
  console.log(data);
};

// Get about info
const getAbout = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/about');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching about info:', error);
  }
};
```

### TypeScript (с типами)

```typescript
interface AboutResponse {
  title: string;
  description: string;
  author: string;
  version: string;
  links: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  technologies: string[];
}

const getAbout = async (): Promise<AboutResponse> => {
  const response = await fetch('http://localhost:5000/api/about');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
```

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get system info
const getSystemInfo = async () => {
  try {
    const { data } = await api.get('/info');
    return data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

---

## Тестирование API

### cURL примеры

```bash
# Health check
curl http://localhost:5000/api/health

# System info
curl http://localhost:5000/api/info

# About
curl http://localhost:5000/api/about

# С заголовками
curl -H "Content-Type: application/json" \
     http://localhost:5000/api/about
```

### Postman Collection

Импортируйте следующую коллекцию в Postman:

```json
{
  "info": {
    "name": "SinShell API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "System Info",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/info"
      }
    },
    {
      "name": "About",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/about"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

---

## Changelog

### Version 1.0.0 (2026-01-23)
- Начальный релиз
- Добавлены endpoints: health, info, about
- Базовая обработка ошибок
- CORS поддержка

---

**Версия документа**: 1.0  
**Дата создания**: 2026-01-23  
**Автор**: Architect Mode