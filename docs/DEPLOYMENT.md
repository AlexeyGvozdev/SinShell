# Развертывание SinShell в Yandex Cloud

## Обзор

SinShell - это терминальное веб-приложение, состоящее из Next.js фронтенда и Express.js бэкенда. Приложение упаковано в единый Docker контейнер для удобного развертывания.

## Архитектура развертывания

```
┌─────────────────────────────────────┐
│           Yandex Cloud              │
│  ┌─────────────────────────────────┐ │
│  │      App Platform               │ │
│  │  ┌─────────────────────────────┐│ │
│  │  │     Docker Container        ││ │
│  │  │  ┌─────────┐  ┌───────────┐ ││ │
│  │  │  │ Next.js │  │ Express   │ ││ │
│  │  │  │Frontend │  │ Backend   │ ││ │
│  │  │  │(Port 80)│  │(Port 5000)│ ││ │
│  │  │  └─────────┘  └───────────┘ ││ │
│  │  └─────────────────────────────┘│ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Подготовка к развертыванию

### 1. Требования

- Аккаунт Yandex Cloud с активным биллингом
- Установленный Yandex CLI (для локальной работы)
- Git репозиторий с кодом проекта

### 2. Структура проекта

```
sinshell/
├── Dockerfile                 # Многоэтапная сборка
├── server.js                  # Единый сервер для фронтенда и бэкенда
├── .dockerignore             # Исключения для Docker
├── .env.production           # Переменные окружения для production
├── frontend/                 # Next.js приложение
│   ├── next.config.ts        # Конфигурация с standalone output
│   └── package.json
└── backend/                  # Express.js API
    ├── src/
    └── package.json
```

## Развертывание через Yandex Cloud Console

### Шаг 1: Создание реестра контейнеров

1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в сервис **Container Registry**
3. Нажмите **"Создать реестр"**
4. Укажите имя реестра: `sinshell-registry`
5. Нажмите **"Создать"**

### Шаг 2: Настройка аутентификации

1. Установите [Yandex CLI](https://cloud.yandex.ru/docs/cli/quickstart)
2. Выполните команду для аутентификации:
   ```bash
   yc init
   ```
3. Получите IAM токен для Docker:
   ```bash
   yc iam create-token
   ```

### Шаг 3: Сборка и загрузка образа

1. Авторизуйтесь в реестре контейнеров:
   ```bash
   docker login cr.yandex.io --username iam --password $(yc iam create-token)
   ```

2. Соберите Docker образ:
   ```bash
   docker build -t cr.yandex.io/<registry-id>/sinshell:latest .
   ```

3. Загрузите образ в реестр:
   ```bash
   docker push cr.yandex.io/<registry-id>/sinshell:latest
   ```

### Шаг 4: Создание приложения

1. В Yandex Cloud Console перейдите в сервис **Cloud Functions → Application Platform**
2. Нажмите **"Создать приложение"**
3. Заполните параметры:
   - **Имя приложения**: `sinshell-app`
   - **Описание**: `Terminal styled website`
   - **Среда выполнения**: `Node.js 18`
   - **Ресурсы**: минимальные (100 МБ RAM, 1 vCPU)

4. В разделе **"Редактор"** выберите:
   - **Тип**: **"Из реестра контейнеров"**
   - **URL образа**: `cr.yandex.io/<registry-id>/sinshell:latest`
   - **Порт**: `80`

5. В разделе **"Переменные окружения"** добавьте:
   ```
   NODE_ENV=production
   PORT=5000
   HOST=0.0.0.0
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_APP_NAME=SinShell
   LOG_LEVEL=info
   ```

6. Нажмите **"Создать приложение"**

### Шаг 5: Настройка домена

1. После создания приложения перейдите в его настройки
2. В разделе **"Домены"** нажмите **"Добавить домен"**
3. Укажите ваш домен или используйте автоматически сгенерированный
4. Настройте SSL-сертификат (автоматически)

## Развертывание через Yandex CLI

### Автоматизированное развертывание

Создайте скрипт `deploy.sh`:

```bash
#!/bin/bash

# Переменные
REGISTRY_ID="your-registry-id"
APP_NAME="sinshell-app"
IMAGE_TAG="latest"

# Сборка и загрузка образа
echo "Building Docker image..."
docker build -t cr.yandex.io/$REGISTRY_ID/sinshell:$IMAGE_TAG .

echo "Pushing image to registry..."
docker push cr.yandex.io/$REGISTRY_ID/sinshell:$IMAGE_TAG

# Обновление приложения
echo "Updating application..."
yc serverless container update \
  --name $APP_NAME \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:$IMAGE_TAG \
  --port 80 \
  --memory 128M \
  --cores 1

echo "Deployment completed!"
```

Сделайте скрипт исполняемым:
```bash
chmod +x deploy.sh
```

## Мониторинг и логирование

### Просмотр логов

1. В Yandex Cloud Console перейдите к приложению
2. В разделе **"Мониторинг"** выберите **"Логи"**
3. Фильтруйте по времени и уровню логов

### Мониторинг ресурсов

1. В разделе **"Мониторинг"** просмотрите:
   - Использование CPU
   - Использование памяти
   - Количество запросов
   - Время ответа

### Настройка алертов

1. В разделе **"Мониторинг"** создайте алерты для:
   - Высокое использование CPU (>80%)
   - Высокое использование памяти (>90%)
   - Ошибки 5xx
   - Время ответа (>5 секунд)

## Обновление приложения

### Автоматическое обновление

1. Внесите изменения в код
2. Соберите и загрузите новый образ:
   ```bash
   docker build -t cr.yandex.io/<registry-id>/sinshell:v1.1.0 .
   docker push cr.yandex.io/<registry-id>/sinshell:v1.1.0
   ```
3. Обновите приложение через CLI или Console:
   ```bash
   yc serverless container update \
     --name sinshell-app \
     --image cr.yandex.io/<registry-id>/sinshell:v1.1.0
   ```

### Blue-Green развертывание

Для нулевого простоя используйте два приложения:

1. `sinshell-app-blue` (активное)
2. `sinshell-app-green` (новая версия)

Переключайте трафик через настройки домена.

## Безопасность

### Рекомендации

1. **Переменные окружения**: Не храните секреты в коде, используйте переменные окружения
2. **CORS**: Ограничьте домены в production
3. **Rate limiting**: Включите ограничение запросов
4. **HTTPS**: Используйте только HTTPS в production
5. **Логирование**: Не логируйте чувствительные данные

### Настройка безопасности

В `.env.production`:
```env
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_CORS=true
ENABLE_RATE_LIMITING=true
```

## Оптимизация производительности

### Настройки ресурсов

Для среднего трафика (100-1000 пользователей в день):
- **Память**: 128-256 MB
- **CPU**: 1 vCPU
- **Масштабирование**: Автоматическое

### Кэширование

1. **Статические ресурсы**: Next.js автоматически кэширует
2. **API ответы**: Рассмотрите Redis для частых запросов
3. **CDN**: Включите Yandex CDN для статических файлов

## Траблшутинг

### Частые проблемы

1. **Приложение не запускается**
   - Проверьте логи в Console
   - Убедитесь что порт 80 доступен
   - Проверьте переменные окружения

2. **API не работает**
   - Проверьте что бэкенд запущен на порту 5000
   - Убедитесь что проксирование настроено правильно
   - Проверьте CORS настройки

3. **Медленная загрузка**
   - Увеличьте ресурсы приложения
   - Включите кэширование
   - Оптимизируйте изображения и ассеты

### Полезные команды

```bash
# Просмотр логов приложения
yc serverless container logs --name sinshell-app --follow

# Проверка статуса приложения
yc serverless container get --name sinshell-app

# Перезапуск приложения
yc serverless container restart --name sinshell-app
```

## Резервное копирование

### Бэкап конфигурации

Регулярно экспортируйте конфигурацию:

```bash
# Экспорт переменных окружения
yc serverless container get --name sinshell-app --format yaml > config-backup.yaml
```

### Бэкup кода

Храните код в Git репозитории с тегами версий:

```bash
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

## Заключение

Следуя этому руководству, вы сможете развернуть SinShell в Yandex Cloud App Platform с высокой доступностью, масштабируемостью и безопасностью.