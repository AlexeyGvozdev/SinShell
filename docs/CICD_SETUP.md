# 🚀 Настройка CI/CD для автоматического развертывания в Yandex Cloud

## 📋 Обзор

Этот документ описывает настройку автоматического развертывания приложения SinShell в Yandex Cloud с использованием GitHub Actions и официальных экшенов Yandex Cloud.

## 🔄 Как работает CI/CD пайплайн

```
Push/Pull Request → GitHub Actions → yc-actions/yc-sls-container-deploy → Yandex Cloud
```

### Этапы пайплайна:

1. **Триггер**: Push в `main` или PR в `main`
2. **Развертывание**: Использование официального экшена Yandex Cloud
3. **Уведомление**: Результаты развертывания

---

## 🛠️ Настройка

### Шаг 1: Создание сервисного аккаунта в Yandex Cloud

1. **Откройте консоль Yandex Cloud**
2. Перейдите в ваш каталог
3. **Сервисные аккаунты** → **Создать сервисный аккаунт**
4. **Имя**: `github-actions-deployer`
5. **Описание**: `Account for GitHub Actions CI/CD deployment`

### Шаг 2: Настройка прав доступа

Назначьте необходимые роли сервисному аккаунту:

```bash
# Назначение ролей сервисному аккаунту
yc resource-manager folder add-access-binding \
  --name your-folder-name \
  --role container-registry.images.pull \
  --service-account-name github-actions-deployer

yc resource-manager folder add-access-binding \
  --name your-folder-name \
  --role container-registry.images.push \
  --service-account-name github-actions-deployer

yc resource-manager folder add-access-binding \
  --name your-folder-name \
  --role serverless.containers.admin \
  --service-account-name github-actions-deployer
```

### Шаг 3: Создание авторизованного ключа

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

# ID сервисного аккаунта
yc iam service-account get --name github-actions-deployer --format json | jq -r '.id'

#### Как узнать YC_SERVICE_ACCOUNT_ID:

Есть несколько способов получить ID сервисного аккаунта:

**Способ 1: Через CLI (рекомендуется)**
```bash
yc iam service-account get --name github-actions-deployer --format json | jq -r '.id'
```

**Способ 2: Через CLI без jq**
```bash
yc iam service-account get --name github-actions-deployer
```
Найдите в выводе поле `id` (выглядит как `aje1234567890abcdef`)

**Способ 3: Список всех сервисных аккаунтов**
```bash
yc iam service-account list --format json | jq -r '.[] | select(.name == "github-actions-deployer") | .id'
```

**Способ 4: Через веб-консоль**
1. Откройте Yandex Cloud консоль
2. Перейдите в ваш каталог
3. Сервисные аккаунты → найдите `github-actions-deployer`
4. ID будет указан в деталях аккаунта

**Пример вывода команды:**
```
id: aje1234567890abcdef
folder_id: b1g1234567890abcdef
created_at: "2024-01-01T00:00:00Z"
name: github-actions-deployer
description: "Account for GitHub Actions CI/CD deployment"
status: ACTIVE
```

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
| `YC_SA_JSON_CREDENTIALS` | JSON с авторизованным ключом | Содержимое `key.json` |
| `YC_CLOUD_ID` | ID вашего облака | `b1gXXXXXXXXXXXXXXXX` |
| `YC_FOLDER_ID` | ID вашего каталога | `b1gXXXXXXXXXXXXXXXX` |
| `YC_REGISTRY_ID` | ID реестра контейнеров | `crpXXXXXXXXXXXXXXXX` |
| `YC_SERVICE_ACCOUNT_ID` | ID сервисного аккаунта | `ajeXXXXXXXXXXXXXXXX` |
| `APP_DOMAIN` | Домен приложения | Получите после первого развертывания |

**Альтернативный метод аутентификации (если проблемы с JSON):**
| `YC_IAM_TOKEN` | IAM токен сервисного аккаунта | Получите через `yc iam create-token` |

---

## 📝 Файл CI/CD пайплайна

Файл [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) содержит:

### Jobs:

1. **deploy**:
   - Использует официальный экшен `yc-actions/yc-sls-container-deploy@v1`
   - Автоматически собирает и загружает Docker образ
   - Обновляет Serverless Container
   - Передает переменные окружения

### Триггеры:

```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
```

### Конфигурация развертывания:

```yaml
- name: Deploy Serverless Container
  uses: yc-actions/yc-sls-container-deploy@v1
  with:
    yc-sa-json-credentials: ${{ secrets.YC_SA_JSON_CREDENTIALS }}
    container-name: sinshell-app
    folder-id: ${{ secrets.YC_FOLDER_ID }}
    revision-service-account-id: ${{ secrets.YC_SERVICE_ACCOUNT_ID }}
    revision-cores: 1
    revision-memory: 256MB
    revision-core-fraction: 100
    revision-concurrency: 8
    revision-image-url: cr.yandex.io/${{ secrets.YC_REGISTRY_ID }}/sinshell:${{ github.sha }}
    revision-execution-timeout: 30
    environment: |
      NODE_ENV=production
      PORT=5000
      HOST=0.0.0.0
      NEXT_PUBLIC_API_URL=https://${{ secrets.APP_DOMAIN }}
      NEXT_PUBLIC_APP_NAME=SinShell
      LOG_LEVEL=info
    min-instances: 0
    max-instances: 5
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
git commit -m "feat: add CI/CD pipeline with yc-actions"
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
# Проверьте авторизованный ключ
yc iam key list --service-account-name github-actions-deployer
```

**Проблема: Нет прав доступа**
```bash
# Проверьте права сервисного аккаунта
yc resource-manager folder list-access-bindings --name your-folder-name
```

**Проблема: Ошибка экшена yc-actions**
- Убедитесь что все секреты правильно настроены
- Проверьте формат JSON в `YC_SA_JSON_CREDENTIALS` (см. [YC_SA_JSON_FORMAT_GUIDE.md](YC_SA_JSON_FORMAT_GUIDE.md))
- Убедитесь что сервисный аккаунт имеет необходимые права

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

### Переменные окружения

Можно добавлять дополнительные переменные окружения:

```yaml
environment: |
  NODE_ENV=production
  PORT=5000
  HOST=0.0.0.0
  NEXT_PUBLIC_API_URL=https://${{ secrets.APP_DOMAIN }}
  NEXT_PUBLIC_APP_NAME=SinShell
  LOG_LEVEL=info
  CUSTOM_VAR=value
```

### Настройка ресурсов

Измените параметры контейнера под ваши нужды:

```yaml
revision-cores: 2                    # Количество ядер
revision-memory: 512MB               # Память
revision-core-fraction: 100          # Доля ядра
revision-concurrency: 16             # Конкурентность
revision-execution-timeout: 60       # Таймаут выполнения
min-instances: 1                     # Минимальное количество инстансов
max-instances: 10                    # Максимальное количество инстансов
```

---

## 🛡️ Безопасность

### Рекомендации

1. **Минимальные права**: Давайте сервисному аккаунту только необходимые права
2. **Ротация ключей**: Регулярно обновляйте авторизованные ключи
3. **Аудит**: Включите логирование действий сервисного аккаунта
4. **Ветвление**: Используйте separate ветки для staging и production

### Безопасное хранение секретов

```bash
# Использование Yandex Lockbox для хранения секретов
yc lockbox payload create \
  --name github-secrets \
  --payload '{"YC_SA_JSON_CREDENTIALS": "your-json-key"}'
```

---

## 📊 Оптимизация

### Ускорение развертывания

1. **Кэширование Docker**: Экшен автоматически кэширует слои
2. **Параллельные деплои**: Можно настроить деплой в разные окружения
3. **Оптимизация Docker**: Используйте многоэтапную сборку

### Оптимизация Docker

```dockerfile
# Многоэтапная сборка с кэшированием
FROM node:18-alpine AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
COPY --from=deps /node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /node_modules ./node_modules
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

---

## 🔄 Rollback

### Автоматический rollback

Можно добавить автоматический откат при неудачном развертывании:

```yaml
- name: Rollback on failure
  if: failure()
  uses: yc-actions/yc-sls-container-deploy@v1
  with:
    yc-sa-json-credentials: ${{ secrets.YC_SA_JSON_CREDENTIALS }}
    container-name: sinshell-app
    folder-id: ${{ secrets.YC_FOLDER_ID }}
    revision-image-url: cr.yandex.io/${{ secrets.YC_REGISTRY_ID }}/sinshell:latest
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
- [yc-actions GitHub organization](https://github.com/yc-actions)

### Официальные экшены Yandex Cloud

- [yc-actions/yc-sls-container-deploy](https://github.com/yc-actions/yc-sls-container-deploy)
- [yc-actions/yc-coi-deploy](https://github.com/yc-actions/yc-coi-deploy)
- [yc-actions/yc-sls-function](https://github.com/yc-actions/yc-sls-function)
- [yc-actions/yc-lockbox](https://github.com/yc-actions/yc-lockbox)

### Траблшутинг

1. **Проверьте логи** в GitHub Actions
2. **Проверьте права** сервисного аккаунта
3. **Проверьте переменные окружения** в GitHub Secrets
4. **Проверьте статус приложения** в Yandex Cloud консоли
5. **Используйте официальные экшены** yc-actions для лучшей совместимости

---

## 🆕 Преимущества нового подхода

### По сравнению с ручным развертыванием:

1. **Официальные экшены**: Используйте поддерживаемые Yandex Cloud экшены
2. **Автоматическая сборка**: Docker образ собирается автоматически
3. **Простота конфигурации**: Меньше кода, больше функциональности
4. **Надежность**: Официальная поддержка и регулярные обновления
5. **Безопасность**: Лучшие практики аутентификации

### По сравнению со старым CI/CD:

1. **Убран линтинг**: Фокус только на развертывании
2. **Убраны тесты**: CI отвечает за тесты, CD - за развертывание
3. **Простота**: Один job вместо нескольких
4. **Скорость**: Быстрое развертывание без лишних проверок

---

**🎉 Готово! Теперь ваше приложение будет автоматически развертываться при каждом push в ветку `main` с использованием официальных экшенов Yandex Cloud!**