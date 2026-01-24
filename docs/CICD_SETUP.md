# 🚀 Настройка CI/CD для автоматического развертывания в Yandex Cloud

## 📋 Обзор

Этот документ описывает настройку автоматического развертывания приложения SinShell в Yandex Cloud при мерже в ветку `main` с использованием GitHub Actions.

## 🔄 Как работает CI/CD пайплайн

```
Push/Pull Request → GitHub Actions → Тесты → Сборка Docker → Деплой → Yandex Cloud
```

### Этапы пайплайна:

1. **Триггер**: Push в `main` или закрытие PR в `main`
2. **Тестирование**: Линтинг, тесты, сборка
3. **Сборка**: Docker образ с тегом коммита
4. **Развертывание**: Обновление приложения в Yandex Cloud
5. **Уведомление**: Результаты развертывания

---

## 🛠️ Настройка

### Шаг 1: Создание сервисного аккаунта в Yandex Cloud

1. **Откройте консоль Yandex Cloud**
2. Перейдите в ваш каталог
3. **Сервисные аккаунты** → **Создать сервисный аккаунт**
4. **Имя**: `github-actions-deployer`
5. **Описание**: `Account for GitHub Actions CI/CD deployment`

### Шаг 2: Настройка прав доступа

Создайте роль с необходимыми правами:

```bash
# Создание роли
yc iam role create \
  --name sinshell-deployer \
  --description "Role for SinShell deployment"

# Назначение прав
yc iam role update sinshell-deployer \
  --add-permission container-registry.images.pull \
  --add-permission container-registry.images.push \
  --add-permission serverless.containers.update \
  --add-permission serverless.containers.get
```

Назначьте роль сервисному аккаунту:

```bash
yc resource-manager folder add-access-binding \
  --name your-folder-name \
  --role sinshell-deployer \
  --service-account-name github-actions-deployer
```

### Шаг 3: Создание API ключа

```bash
yc iam key create \
  --service-account-name github-actions-deployer \
  --output key.json
```

Сохраните содержимое `key.json` - оно понадобится для GitHub Secrets.

### Шаг 4: Получение необходимых ID

```bash
# ID облака
yc config get cloud-id

# ID каталога
yc config get folder-id

# Проверьте есть ли реестр контейнеров
yc container registry list --format json

# Если реестр пустой, создайте его
yc container registry create --name sinshell-registry

# ID реестра контейнеров
yc container registry list --format json | jq -r '.[0].id'

# Домен приложения (после первого развертывания)
yc serverless container get --name sinshell-app --format json | jq -r '.status[0].domainName'
```

---

## 🔧 Настройка GitHub Secrets

Перейдите в ваш GitHub репозиторий:
1. **Settings** → **Secrets and variables** → **Actions**
2. Нажмите **"New repository secret"**
3. Добавьте следующие секреты:

| Secret Name | Description | Value |
|-------------|-------------|-------|
| `YC_IAM_TOKEN` | IAM токен для аутентификации | Содержимое `key.json` или IAM токен |
| `YC_CLOUD_ID` | ID вашего облака | `b1gXXXXXXXXXXXXXXXX` |
| `YC_FOLDER_ID` | ID вашего каталога | `b1gXXXXXXXXXXXXXXXX` |
| `YC_REGISTRY_ID` | ID реестра контейнеров | `crpXXXXXXXXXXXXXXXX` |
| `APP_DOMAIN` | Домен приложения | Получите после первого развертывания |

### Получение IAM токена для GitHub Secret

```bash
# Создание статического ключа доступа
yc iam access-key create \
  --service-account-name github-actions-deployer \
  --format json > access-key.json

# Или получение временного IAM токена
yc iam create-token --service-account-name github-actions-deployer
```

---

## 📝 Файл CI/CD пайплайна

Файл [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) содержит:

### Jobs:

1. **test**:
   - Установка зависимостей
   - Линтинг кода
   - Запуск тестов с покрытием
   - Сборка фронтенда и бэкенда

2. **deploy**:
   - Сборка Docker образа
   - Загрузка в Yandex Container Registry
   - Обновление приложения в Yandex Cloud
   - Уведомление о результате

### Триггеры:

```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
    types: [closed]
```

---

## 🚀 Первый запуск

### Шаг 1: Первоначальное развертывание

Перед настройкой CI/CD выполните первоначальное развертывание:

```bash
# Следуйте инструкции в YANDEX_CLOUD_DEPLOY_GUIDE.md
./deploy.sh
```

### Шаг 2: Проверка работы

1. Сделайте коммит и push в `main`:
```bash
git add .
git commit -m "feat: add CI/CD pipeline"
git push origin main
```

2. Перейдите в **Actions** в вашем GitHub репозитории
3. Убедитесь что пайплайн запустился и завершился успешно

---

## 🔍 Мониторинг CI/CD

### Просмотр логов

1. **GitHub Actions**: Перейдите в **Actions** → выберите запуск
2. **Yandex Cloud**: Просмотр логов приложения:
```bash
yc serverless container logs --name sinshell-app --follow
```

### Отладка проблем

**Проблема: Ошибка аутентификации**
```bash
# Проверьте IAM токен
yc iam create-token --service-account-name github-actions-deployer
```

**Проблема: Нет прав доступа**
```bash
# Проверьте права сервисного аккаунта
yc resource-manager folder list-access-bindings --name your-folder-name
```

**Проблема: Ошибка сборки**
- Проверьте логи в GitHub Actions
- Убедитесь что все тесты проходят локально
- Проверьте Dockerfile

---

## ⚙️ Дополнительные настройки

### Ветвление

Для разных окружений можно настроить разные пайплайны:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [ develop ]

# .github/workflows/deploy-production.yml  
on:
  push:
    branches: [ main ]
```

### Кэширование

Пайплайн использует кэширование для ускорения сборки:

```yaml
- name: Cache Docker layers
  uses: actions/cache@v3
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-
```

### Уведомления

Можно добавить уведомления в Telegram/Slack:

```yaml
- name: Notify Telegram
  if: always()
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      🚀 Deployment ${{ job.status }}!
      📦 Commit: ${{ github.sha }}
      🌐 URL: https://${{ secrets.APP_DOMAIN }}
```

---

## 🛡️ Безопасность

### Рекомендации

1. **Минимальные права**: Давайте сервисному аккаунту только необходимые права
2. **Ротация ключей**: Регулярно обновляйте IAM токены
3. **Аудит**: Включите логирование действий сервисного аккаунта
4. **Ветвление**: Используйте separate ветки для staging и production

### Безопасное хранение секретов

```bash
# Использование Yandex Lockbox для хранения секретов
yc lockbox payload create \
  --name github-secrets \
  --payload '{"YC_IAM_TOKEN": "your-token"}'
```

---

## 📊 Оптимизация

### Ускорение сборки

1. **Параллельные тесты**:
```yaml
strategy:
  matrix:
    node-version: [18.x]
```

2. **Кэширование зависимостей**:
```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      frontend/node_modules
      backend/node_modules
```

3. **Оптимизация Docker**:
```dockerfile
# Многоэтапная сборка с кэшированием
FROM node:18-alpine AS deps
COPY package*.json ./
RUN npm ci --only=production
```

---

## 🔄 Rollback

### Автоматический rollback

Можно добавить автоматический откат при неудачном развертывании:

```yaml
- name: Rollback on failure
  if: failure()
  run: |
    yc serverless container update \
      --name sinshell-app \
      --image cr.yandex.io/${{ secrets.YC_REGISTRY_ID }}/sinshell:latest
```

### Ручной rollback

```bash
# Получение списка образов
yc container image list --repository-name cr.yandex.io/$REGISTRY_ID/sinshell

# Откат на предыдущую версию
yc serverless container update \
  --name sinshell-app \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:previous-version
```

---

## 📞 Поддержка

### Полезные ссылки

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Yandex Cloud Container Registry](https://cloud.yandex.ru/docs/container-registry/)
- [Yandex Cloud Serverless Containers](https://cloud.yandex.ru/docs/serverless-containers/)

### Траблшутинг

1. **Проверьте логи** в GitHub Actions
2. **Проверьте права** сервисного аккаунта
3. **Проверьте переменные окружения** в GitHub Secrets
4. **Проверьте статус приложения** в Yandex Cloud консоли

---

**🎉 Готово! Теперь ваше приложение будет автоматически развертываться при каждом мерже в ветку `main`!**