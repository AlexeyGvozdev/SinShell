# ⚡ Быстрая настройка CI/CD для автоматического деплоя

## 🎯 Цель
Настроить автоматическое развертывание в Yandex Cloud при мерже в `main` ветку.

## 📋 Что нужно сделать (5 шагов)

### Шаг 1: Создание сервисного аккаунта в Yandex Cloud

```bash
# 1. Создайте сервисный аккаунт
yc iam service-account create --name github-actions-deployer

# 2. Назначьте права
yc resource-manager folder add-access-binding \
  --name sinshell \
  --role editor \
  --service-account-name github-actions-deployer

# 3. Создайте API ключ
yc iam key create \
  --service-account-name github-actions-deployer \
  --output key.json
```

### Шаг 2: Получение необходимых ID

```bash
# Сохраните эти значения - они понадобятся для GitHub Secrets
yc config get cloud-id          # YC_CLOUD_ID
yc config get folder-id         # YC_FOLDER_ID

# Проверьте есть ли реестр, если нет - создайте его
yc container registry list --format json

# Если реестр пустой, создайте его:
yc container registry create --name sinshell-registry

# Получите ID реестра
yc container registry list --format json | jq -r '.[0].id'  # YC_REGISTRY_ID
```

### Шаг 3: Настройка GitHub Secrets

Перейдите в GitHub → Settings → Secrets and variables → Actions

Добавьте 5 секретов:

| Secret Name | Value |
|-------------|-------|
| `YC_IAM_TOKEN` | Содержимое `key.json` |
| `YC_CLOUD_ID` | Ваш ID облака |
| `YC_FOLDER_ID` | Ваш ID каталога |
| `YC_REGISTRY_ID` | ID реестра контейнеров |
| `APP_DOMAIN` | Получите после первого развертывания (см. Шаг 4) |

### Шаг 4: Первоначальное развертывание

```bash
# Если еще не развертывали
./deploy.sh

# Получите домен приложения
APP_DOMAIN=$(yc serverless container get --name sinshell-app --format json | jq -r '.status[0].domainName')
echo "Ваш домен: $APP_DOMAIN"

# Добавьте домен в GitHub Secrets
# Перейдите в GitHub → Settings → Secrets → Actions → Add secret
# Name: APP_DOMAIN
# Value: $APP_DOMAIN
```

### Шаг 5: Тестирование CI/CD

```bash
# Сделайте тестовый коммит
git add .github/workflows/
git commit -m "feat: add CI/CD pipeline"
git push origin main
```

Перейдите в GitHub → Actions и дождитесь завершения пайплайна.

---

## 🔧 Что делает CI/CD пайплайн

### Автоматически при push в main:
1. ✅ Запускает тесты
2. ✅ Проверяет линтинг
3. ✅ Собирает Docker образ
4. ✅ Загружает в Yandex Cloud Registry
5. ✅ Обновляет приложение
6. ✅ Отправляет уведомление о результате

### Триггеры:
- Push в `main` ветку
- Закрытие Pull Request в `main`

---

## 🚀 Проверка работы

### Успешный деплой:
```
✅ Deployment to Yandex Cloud completed successfully!
🌐 Your app is available at: https://your-domain.yandexcloud.net
```

### Просмотр логов:
- **GitHub**: Actions → выберите запуск
- **Yandex Cloud**: `yc serverless container logs --name sinshell-app --follow`

---

## 🆘 Частые проблемы

### ❌ DNS ошибка: "no such host" или "cannot resolve cr.yandex.io"
**Проблема**: Ваш DNS не может разрешить домен Yandex Cloud

**🚀 Решение**: Используйте альтернативный способ развертывания
```bash
# Следуйте инструкции: DEPLOY_WITHOUT_LOCAL_DOCKER.md
```

Этот способ использует:
- GitHub Actions для сборки (работают в облаке с правильным DNS)
- Статические ключи доступа вместо IAM токенов
- UI сборку в Yandex Cloud как запасной вариант

### ❌ "Permission denied"
**Решение**: Проверьте права сервисного аккаунта
```bash
yc resource-manager folder list-access-bindings --name your-folder-name
```

### ❌ "Authentication failed"
**Решение**: Используйте статические ключи доступа
```bash
yc iam access-key create \
  --service-account-name github-actions-deployer \
  --format json > access-key.json
```

### ❌ "Build failed"
**Решение**: Проверьте что тесты проходят локально
```bash
npm test
npm run lint
npm run build
```

### 🔧 Быстрая проверка DNS
```bash
# Проверьте разрешение домена
ping cr.yandex.io
nslookup cr.yandex.io

# Если не работает, используйте альтернативный способ
```

---

## 📊 Мониторинг

### Статус приложения:
```bash
yc serverless container get --name sinshell-app
```

### Логи в реальном времени:
```bash
yc serverless container logs --name sinshell-app --follow
```

### Метрики:
- CPU и память usage
- Количество запросов
- Время ответа
- Ошибки

---

## 💡 Советы

### Безопасность:
- Используйте отдельный сервисный аккаунт для CI/CD
- Давайте только необходимые права (не `admin`)
- Регулярно обновляйте IAM токены

### Оптимизация:
- Включите кэширование в GitHub Actions
- Используйте многоэтапную сборку Docker
- Оптимизируйте размер образа

### Rollback:
```bash
# Откат на предыдущую версию
yc serverless container update \
  --name sinshell-app \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:latest
```

---

## 🎉 Готово!

Теперь каждый мерж в `main` ветку будет автоматически развертывать ваше приложение в Yandex Cloud!

**Workflow**: `Разработка → Pull Request → Мерж → Автодеплой → Продакшен**

📖 **Подробная документация**: [docs/CICD_SETUP.md](docs/CICD_SETUP.md)