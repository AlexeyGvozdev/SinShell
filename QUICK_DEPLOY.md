# Быстрое развертывание SinShell в Yandex Cloud

## 🚀 Развертывание за 5 минут

### Предварительные требования

1. **Аккаунт Yandex Cloud** с активным биллингом
2. **Yandex CLI** - [инструкция по установке](https://cloud.yandex.ru/docs/cli/quickstart)
3. **Docker** - [инструкция по установке](https://docs.docker.com/get-docker/)

### Шаг 1: Аутентификация

```bash
# Инициализация Yandex CLI
yc init

# Проверка аутентификации
yc config profile get
```

### Шаг 2: Развертывание

```bash
# Запуск автоматического развертывания
./deploy.sh
```

Скрипт автоматически:
- ✅ Создаст реестр контейнеров (если нужно)
- ✅ Соберет Docker образ
- ✅ Загрузит образ в реестр
- ✅ Создаст/обновит приложение
- ✅ Настроит переменные окружения
- ✅ Предоставит URL для доступа

### Шаг 3: Проверка

После развертывания скрипт покажет URL приложения. Проверьте работу:

```bash
# Проверка health endpoint
curl https://your-app-url.yandexcloud.net/api/v1/health

# Проверка в браузере
# Откройте https://your-app-url.yandexcloud.net
```

## 🛠️ Ручное развертывание

Если автоматический скрипт не работает, выполните шаги вручную:

### 1. Создание реестра

```bash
yc container registry create --name sinshell-registry
```

### 2. Сборка и загрузка образа

```bash
# Получение ID реестра
REGISTRY_ID=$(yc container registry list --format json | jq -r '.[0].id')

# Сборка образа
docker build -t cr.yandex.io/$REGISTRY_ID/sinshell:latest .

# Авторизация и загрузка
docker login cr.yandex.io --username iam --password $(yc iam create-token)
docker push cr.yandex.io/$REGISTRY_ID/sinshell:latest
```

### 3. Создание приложения

```bash
yc serverless container create \
  --name sinshell-app \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:latest \
  --port 80 \
  --memory 256M \
  --cores 1 \
  --environment NODE_ENV=production \
  --environment PORT=5000 \
  --environment NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🔧 Управление приложением

### Просмотр логов

```bash
yc serverless container logs --name sinshell-app --follow
```

### Обновление приложения

```bash
# Пересобрать образ
docker build -t cr.yandex.io/$REGISTRY_ID/sinshell:v2.0.0 .
docker push cr.yandex.io/$REGISTRY_ID/sinshell:v2.0.0

# Обновить приложение
yc serverless container update \
  --name sinshell-app \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:v2.0.0
```

### Удаление приложения

```bash
yc serverless container delete --name sinshell-app
yc container registry delete --name sinshell-registry
```

## 📊 Мониторинг

- **Консоль Yandex Cloud** → Application Platform → sinshell-app
- **Метрики**: CPU, память, запросы, ошибки
- **Логи**: в реальном времени через CLI или консоль

## 🐛 Траблшутинг

### Приложение не запускается

```bash
# Проверка статуса
yc serverless container get --name sinshell-app

# Просмотр логов ошибок
yc serverless container logs --name sinshell-app --since 1h
```

### Проблемы с доступом

1. Убедитесь что порт 80 настроен
2. Проверьте переменные окружения
3. Проверьте что бэкенд слушает порт 5000

### Медленная загрузка

```bash
# Увеличение ресурсов
yc serverless container update \
  --name sinshell-app \
  --memory 512M \
  --cores 2
```

## 💡 Полезные команды

```bash
# Список всех приложений
yc serverless container list

# Информация о приложении
yc serverless container get --name sinshell-app

# Перезапуск приложения
yc serverless container restart --name sinshell-app

# Список реестров
yc container registry list
```

## 📞 Поддержка

- **Документация**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Yandex Cloud docs**: https://cloud.yandex.ru/docs/serverless-containers/
- **Issues**: создайте issue в GitHub репозитории

---

**Готово! 🎉 Ваше терминальное приложение теперь доступно в Yandex Cloud!**