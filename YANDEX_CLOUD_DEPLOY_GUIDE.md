# 🚀 Пошаговая инструкция по развертыванию SinShell в Yandex Cloud

## 📋 Содержание
1. [Подготовка](#подготовка)
2. [Создание аккаунта Yandex Cloud](#создание-аккаунта-yandex-cloud)
3. [Установка и настройка Yandex CLI](#установка-и-настройка-yandex-cli)
4. [Установка Docker](#установка-docker)
5. [Настройка проекта](#настройка-проекта)
6. [Создание реестра контейнеров](#создание-реестра-контейнеров)
7. [Сборка Docker образа](#сборка-docker-образа)
8. [Загрузка образа в реестр](#загрузка-образа-в-реестр)
9. [Создание приложения](#создание-приложения)
10. [Настройка домена](#настройка-домена)
11. [Проверка развертывания](#проверка-развертывания)
12. [Обновление приложения](#обновление-приложения)

---

## 🛠️ Подготовка

### Что вам понадобится:
- Компьютер с macOS, Linux или Windows
- Аккаунт Yandex (обычный почтовый аккаунт)
- Банковская карта для активации биллинга
- Установленный Node.js 18+ (для локальной разработки)
- Git для работы с кодом

### Стоимость:
- **Бесплатный период**: 60 дней с грантом на 4000 рублей
- **После бесплатного периода**: ~100-300 рублей/месяц в зависимости от нагрузки
- **Минимальные затраты**: ~50 рублей/месяц при низкой посещаемости

---

## 🌐 Создание аккаунта Yandex Cloud

### Шаг 1: Регистрация
1. Перейдите на [cloud.yandex.ru](https://cloud.yandex.ru/)
2. Нажмите **"Войти в консоль"**
3. Войдите с помощью вашего Yandex аккаунта
4. Если у вас нет аккаунта, создайте его

### Шаг 2: Активация биллинга
1. После входа в консоль вам предложат активировать биллинг
2. Нажмите **"Активировать"**
3. Заполните форму:
   - **Имя организации**: укажите "ИП" или ваше ФИО
   - **ИНН**: ваш ИНН (можно найти в налоговой)
   - **Банковские данные**: привяжите карту
4. Подтвердите email и телефон

### Шаг 3: Создание платежного аккаунта
1. В консоли перейдите в **"Биллинг"** → **"Платежные аккаунты"**
2. Нажмите **"Создать платежный аккаунт"**
3. Выберите **"Физическое лицо"** или **"ИП"**
4. Заполните данные и подтвердите

> 💡 **Совет**: После активации вы получите грант на 4000 рублей, которого хватит для нескольких месяцев работы

---

## 📥 Установка и настройка Yandex CLI

### Шаг 1: Установка Yandex CLI

**macOS (через Homebrew):**
```bash
brew install yc
```

**Linux:**
```bash
curl https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
exec bash
```

**Windows:**
```powershell
iex (New-Object System.Net.WebClient).DownloadString('https://storage.yandexcloud.net/yandexcloud-yc/install.ps1')
```

### Шаг 2: Инициализация CLI
```bash
yc init
```

Ответьте на вопросы:
1. **Выберите облако**: создайте новое или выберите существующее
2. **Выберите каталог**: создайте новый каталог с именем `sinshell`
3. **Выберите зону доступности**: `ru-central1-a` (рекомендуется)
4. **Аутентификация**: выберите **"Через браузер"**

### Шаг 3: Проверка настройки
```bash
# Проверка профиля
yc config profile get

# Проверка списка каталогов
yc resource-manager folder list
```

---

## 🐳 Установка Docker

### Шаг 1: Установка Docker Desktop

**macOS:**
1. Скачайте [Docker Desktop for Mac](https://docs.docker.com/docker-for-mac/install/)
2. Установите приложение
3. Запустите Docker Desktop
4. Дождитесь полной инициализации

**Linux (Ubuntu/Debian):**
```bash
# Обновление пакетов
sudo apt-get update

# Установка зависимостей
sudo apt-get install ca-certificates curl gnupg lsb-release

# Добавление GPG ключа
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавление репозитория
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker
```

**Windows:**
1. Скачайте [Docker Desktop for Windows](https://docs.docker.com/docker-for-windows/install/)
2. Установите приложение
3. Включите WSL 2 при установке
4. Перезагрузите компьютер

### Шаг 2: Проверка установки
```bash
docker --version
docker-compose --version
```

---

## ⚙️ Настройка проекта

### Шаг 1: Клонирование проекта
```bash
git clone <URL-вашего-репозитория>
cd sinshell
```

### Шаг 2: Проверка файлов развертывания
Убедитесь что в проекте есть следующие файлы:
- `Dockerfile` - конфигурация сборки
- `server.js` - единый сервер
- `.env.production` - переменные окружения
- `.dockerignore` - исключения для Docker

### Шаг 3: Локальная проверка (опционально)
```bash
# Установка зависимостей
npm run install:all

# Запуск для проверки
npm run dev
```

Откройте http://localhost:3000 и проверьте работу приложения

---

## 📦 Создание реестра контейнеров

### Шаг 1: Создание через консоль
1. Откройте [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. В меню слева выберите **Container Registry**
3. Нажмите **"Создать реестр"**
4. Заполните форму:
   - **Имя**: `sinshell-registry`
   - **Описание**: `Registry for SinShell application`
5. Нажмите **"Создать"**

### Шаг 2: Создание через CLI
```bash
yc container registry create \
  --name sinshell-registry \
  --description "Registry for SinShell application"
```

### Шаг 3: Получение ID реестра
```bash
yc container registry list --format json
```

Сохраните ID реестра, он понадобится дальше (формат: `crpXXXXXXXXXXXXXXXX`)

---

## 🔨 Сборка Docker образа

### Шаг 1: Авторизация в реестре
```bash
# Получение IAM токена
IAM_TOKEN=$(yc iam create-token)

# Авторизация в Docker
echo "$IAM_TOKEN" | docker login cr.yandex.io --username iam --password-stdin
```

### Шаг 2: Сборка образа
```bash
# Замените REGISTRY_ID на ваш ID реестра
REGISTRY_ID="crpXXXXXXXXXXXXXXXX"

# Сборка образа
docker build -t cr.yandex.io/$REGISTRY_ID/sinshell:latest .
```

### Шаг 3: Проверка образа
```bash
# Просмотр локальных образов
docker images | grep sinshell

# Проверка работы образа (опционально)
docker run -p 8080:80 cr.yandex.io/$REGISTRY_ID/sinshell:latest
```

Откройте http://localhost:8080 для проверки

---

## ⬆️ Загрузка образа в реестр

### Шаг 1: Загрузка образа
```bash
# Загрузка в реестр
docker push cr.yandex.io/$REGISTRY_ID/sinshell:latest
```

### Шаг 2: Проверка загрузки
```bash
# Просмотр образов в реестре
yc container repository list --registry-name sinshell-registry

# Просмотр конкретного образа
yc container image list --repository-name cr.yandex.io/$REGISTRY_ID/sinshell
```

---

## 🚀 Создание приложения

### Шаг 1: Создание через консоль
1. В Yandex Cloud Console перейдите в **Serverless** → **Application Platform**
2. Нажмите **"Создать приложение"**
3. Заполните основную информацию:
   - **Имя**: `sinshell-app`
   - **Описание**: `Terminal styled website`
   - **Каталог**: выберите ваш каталог
4. В разделе **"Редактор"**:
   - **Тип**: **"Из реестра контейнеров"**
   - **URL образа**: `cr.yandex.io/$REGISTRY_ID/sinshell:latest`
   - **Порт**: `80`
5. В разделе **"Ресурсы"**:
   - **Память**: `256 МБ`
   - **vCPU**: `1`
   - **Время выполнения**: `30 с`
6. В разделе **"Масштабирование"**:
   - **Минимальное количество экземпляров**: `0`
   - **Максимальное количество экземпляров**: `5`
7. В разделе **"Переменные окружения"** добавьте:
   ```
   NODE_ENV=production
   PORT=5000
   HOST=0.0.0.0
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_APP_NAME=SinShell
   LOG_LEVEL=info
   ```
8. Нажмите **"Создать приложение"**

### Шаг 2: Создание через CLI
```bash
yc serverless container create \
  --name sinshell-app \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:latest \
  --port 80 \
  --memory 256M \
  --cores 1 \
  --execution-timeout 30s \
  --environment NODE_ENV=production \
  --environment PORT=5000 \
  --environment HOST=0.0.0.0 \
  --environment NEXT_PUBLIC_API_URL=http://localhost:5000 \
  --environment NEXT_PUBLIC_APP_NAME=SinShell \
  --environment LOG_LEVEL=info \
  --min-instances 0 \
  --max-instances 5 \
  --description "Terminal styled website"
```

---

## 🌐 Настройка домена

### Шаг 1: Получение домена приложения
1. В консоли перейдите к вашему приложению `sinshell-app`
2. В разделе **"Обзор"** найдите **"Домен"**
3. Скопируйте URL вида `https://bbaXXXXXXXXXX.yandexcloud.net`

### Шаг 2: Настройка собственного домена (опционально)
1. В разделе **"Домены"** нажмите **"Добавить домен"**
2. Укажите ваш домен (например, `sinshell.ru`)
3. Настройте DNS записи:
   ```
   TYPE: CNAME
   NAME: @
   VALUE: bbaXXXXXXXXXX.yandexcloud.net
   ```
4. Yandex Cloud автоматически настроит SSL-сертификат

---

## ✅ Проверка развертывания

### Шаг 1: Проверка загрузки
1. Откройте URL вашего приложения в браузере
2. Дождитесь полной загрузки (может занять 1-2 минуты при первом запуске)
3. Проверьте работу терминала

### Шаг 2: Проверка API эндпоинтов
```bash
# Проверка health endpoint
curl https://bbaXXXXXXXXXX.yandexcloud.net/api/v1/health

# Проверка info endpoint
curl https://bbaXXXXXXXXXX.yandexcloud.net/api/v1/info
```

### Шаг 3: Просмотр логов
```bash
# Просмотр логов в реальном времени
yc serverless container logs --name sinshell-app --follow

# Просмотр логов за последний час
yc serverless container logs --name sinshell-app --since 1h
```

---

## 🔄 Обновление приложения

### Способ 1: Через автоматический скрипт
```bash
# Запуск скрипта обновления
./deploy.sh
```

### Способ 2: Вручную
```bash
# 1. Собрать новый образ
docker build -t cr.yandex.io/$REGISTRY_ID/sinshell:v2.0.0 .

# 2. Загрузить в реестр
docker push cr.yandex.io/$REGISTRY_ID/sinshell:v2.0.0

# 3. Обновить приложение
yc serverless container update \
  --name sinshell-app \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:v2.0.0
```

### Способ 3: Через консоль
1. Откройте приложение в консоли
2. Нажмите **"Редактировать"**
3. В разделе **"Редактор"** обновите URL образа
4. Нажмите **"Сохранить"**

---

## 📊 Мониторинг и управление

### Просмотр метрик
1. В консоли перейдите к приложению
2. В разделе **"Мониторинг"** просмотрите:
   - Использование CPU
   - Использование памяти
   - Количество запросов
   - Время ответа

### Управление масштабированием
```bash
# Увеличение ресурсов
yc serverless container update \
  --name sinshell-app \
  --memory 512M \
  --cores 2

# Изменение масштабирования
yc serverless container update \
  --name sinshell-app \
  --min-instances 1 \
  --max-instances 10
```

---

## 🆘 Решение проблем

### Проблема: Приложение не запускается
**Решение:**
```bash
# Проверка статуса
yc serverless container get --name sinshell-app

# Просмотр логов ошибок
yc serverless container logs --name sinshell-app --since 1h --level error
```

### Проблема: 502 Bad Gateway
**Решение:**
1. Проверьте что порт 80 настроен правильно
2. Убедитесь что приложение слушает порт 5000 внутри контейнера
3. Проверьте переменные окружения

### Проблема: Медленная загрузка
**Решение:**
```bash
# Увеличение ресурсов
yc serverless container update \
  --name sinshell-app \
  --memory 512M \
  --cores 2

# Установка минимального количества экземпляров
yc serverless container update \
  --name sinshell-app \
  --min-instances 1
```

### Проблема: Нет доступа к API
**Решение:**
1. Проверьте что бэкенд запущен на порту 5000
2. Проверьте настройки проксирования в Next.js
3. Проверьте CORS настройки

---

## 💡 Полезные советы

### Оптимизация затрат
- Установите `min-instances: 0` для экономии при низкой нагрузке
- Используйте грант на 4000 рублей в первые 2 месяца
- Мониторьте потребление ресурсов в консоли

### Безопасность
- Используйте HTTPS (автоматически в Yandex Cloud)
- Не храните секреты в коде, используйте переменные окружения
- Ограничьте CORS для production

### Производительность
- Используйте CDN для статических файлов
- Оптимизируйте Docker образ (многоэтапная сборка)
- Настройте кэширование на уровне приложения

---

## 📞 Поддержка

- **Документация Yandex Cloud**: https://cloud.yandex.ru/docs/
- **Поддержка**: через консоль Yandex Cloud
- **GitHub Issues**: для проблем с кодом проекта
- **Документация проекта**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

**🎉 Поздравляем! Ваше терминальное приложение SinShell теперь развернуто в Yandex Cloud!**

Если возникли вопросы, проверьте логи приложения или обратитесь в поддержку Yandex Cloud.