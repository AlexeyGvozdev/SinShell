# 🚀 Шпаргалка по развертыванию SinShell в Yandex Cloud

## ⚡ Быстрый старт (5 минут)

### 1. Подготовка
```bash
# Установка Yandex CLI
curl https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
exec bash

# Инициализация
yc init

# Установка Docker (macOS)
brew install docker
```

### 2. Создание реестра
```bash
# Проверьте есть ли реестр
yc container registry list --format json

# Если реестра нет, создайте его
yc container registry create --name sinshell-registry

# Получите ID реестра
REGISTRY_ID=$(yc container registry list --format json | jq -r '.[0].id')
```

### 3. Сборка и загрузка образа
```bash
# Авторизация
echo "$(yc iam create-token)" | docker login cr.yandex.io --username iam --password-stdin

# Сборка
docker build -t cr.yandex.io/$REGISTRY_ID/sinshell:latest .

# Загрузка
docker push cr.yandex.io/$REGISTRY_ID/sinshell:latest
```

### 4. Создание приложения
```bash
# Создание пустого контейнера
yc serverless container create \
  --name sinshell-app \
  --description "Terminal styled website"

# Развертывание с образом
yc serverless container deploy \
  --name sinshell-app \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:latest \
  --port 80 \
  --memory 256M \
  --cores 1 \
  --environment NODE_ENV=production \
  --environment PORT=5000 \
  --environment NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Получение URL
```bash
APP_DOMAIN=$(yc serverless container get --name sinshell-app --format json | jq -r '.status[0].domainName')
echo "Ваш домен: $APP_DOMAIN"
```

---

## 📋 Полезные команды

### Управление приложением
```bash
# Статус приложения
yc serverless container get --name sinshell-app

# Логи в реальном времени
yc serverless container logs --name sinshell-app --follow

# Перезапуск
yc serverless container restart --name sinshell-app

# Удаление
yc serverless container delete --name sinshell-app
```

### Обновление приложения
```bash
# Новая версия
docker build -t cr.yandex.io/$REGISTRY_ID/sinshell:v2.0.0 .
docker push cr.yandex.io/$REGISTRY_ID/sinshell:v2.0.0

# Обновление
yc serverless container deploy \
  --name sinshell-app \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:v2.0.0
```

### Управление реестром
```bash
# Список реестров
yc container registry list

# Список образов
yc container image list --registry-name sinshell-registry

# Удаление реестра
yc container registry delete --name sinshell-registry
```

---

## 🔧 Переменные окружения

### Базовые настройки
```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=SinShell
LOG_LEVEL=info
```

### Для production
```bash
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_CORS=true
ENABLE_RATE_LIMITING=true
```

---

## 📊 Мониторинг

### Просмотр метрик
```bash
# Просмотр логов за последний час
yc serverless container logs --name sinshell-app --since 1h

# Просмотр логов ошибок
yc serverless container logs --name sinshell-app --level error

# Статистика приложения
yc serverless container get --name sinshell-app
```

### Оптимизация ресурсов
```bash
# Увеличение памяти
yc serverless container update \
  --name sinshell-app \
  --memory 512M

# Настройка масштабирования
yc serverless container update \
  --name sinshell-app \
  --min-instances 1 \
  --max-instances 10
```

---

## 🆘 Траблшутинг

### Частые проблемы
```bash
# Проверка статуса
yc serverless container get --name sinshell-app

# Просмотр логов ошибок
yc serverless container logs --name sinshell-app --since 1h --level error

# Проверка образа
docker run -p 8080:80 cr.yandex.io/$REGISTRY_ID/sinshell:latest
```

### Проверка работоспособности
```bash
# Health check
curl https://your-app-url.yandexcloud.net/api/v1/health

# Проверка в браузере
open https://your-app-url.yandexcloud.net
```

---

## 💡 Советы

### Экономия
- Установите `min-instances: 0` для экономии
- Используйте грант 4000₽ в первые 2 месяца
- Мониторьте потребление в консоли

### Безопасность
- Используйте HTTPS (автоматически)
- Храните секреты в переменных окружения
- Ограничьте CORS для production

### Производительность
- Увеличьте память при высокой нагрузке
- Используйте CDN для статики
- Настройте кэширование

---

## 📞 Ссылки

- **Консоль Yandex Cloud**: https://console.cloud.yandex.ru/
- **Документация**: https://cloud.yandex.ru/docs/
- **Поддержка**: через консоль
- **Проект**: https://github.com/AlexeyGvozdev/SinShell

---

**🎯 Готово! Ваше приложение развернуто и доступно по URL из шага 5!**