# 🚀 Развертывание без локального Docker (альтернативный способ)

## 📋 Когда использовать этот способ

Используйте этот метод если у вас проблемы с:
- DNS разрешением `cr.yandex.io`
- Доступом к Yandex Cloud Registry из вашей сети
- Блокировками VPN/прокси
- Настройками локального Docker

## 🔄 Обновленный workflow

Этот метод использует GitHub Actions для сборки и загрузки образа, минуя локальные проблемы.

## 🛠️ Настройка

### Шаг 1: Создание сервисного аккаунта

```bash
# Создание сервисного аккаунта
yc iam service-account create --name github-actions-deployer

# Назначение прав
yc resource-manager folder add-access-binding \
  --name your-folder-name \
  --role editor \
  --service-account-name github-actions-deployer

# Создание статического ключа доступа (рекомендуется)
yc iam access-key create \
  --service-account-name github-actions-deployer \
  --format json > access-key.json
```

### Шаг 2: Получение необходимых ID

```bash
# ID облака и каталога
yc config get cloud-id          # YC_CLOUD_ID
yc config get folder-id         # YC_FOLDER_ID

# Создание реестра (если нет)
yc container registry create --name sinshell-registry

# ID реестра
yc container registry list --format json | jq -r '.[0].id'  # YC_REGISTRY_ID
```

### Шаг 3: Первоначальное развертывание через консоль

1. **Откройте Yandex Cloud Console**
2. **Container Registry** → ваш реестр
3. **Настройте UI сборку**:
   - Нажмите **"Собрать образ"**
   - **Источник**: "GitHub репозиторий"
   - **URL**: `https://github.com/your-username/sinshell`
   - **Dockerfile путь**: `Dockerfile`
   - **Тег**: `latest`
4. **Запустите сборку**
5. **Создайте пустой контейнер**:
   ```bash
   yc serverless container create \
     --name sinshell-app \
     --description "Terminal styled website"
   ```
6. **Разверните приложение с образом**:
   ```bash
   yc serverless container deploy \
     --name sinshell-app \
     --image cr.yandex.io/$REGISTRY_ID/sinshell:latest \
     --port 80 \
     --memory 256M \
     --cores 1 \
     --execution-timeout 30s \
     --environment NODE_ENV=production \
     --environment PORT=5000 \
     --environment HOST=0.0.0.0 \
     --environment NEXT_PUBLIC_API_URL=https://your-domain.yandexcloud.net \
     --environment NEXT_PUBLIC_APP_NAME=SinShell \
     --environment LOG_LEVEL=info \
     --min-instances 0 \
     --max-instances 5
   ```

### Шаг 4: Настройка GitHub Secrets

Добавьте в GitHub → Settings → Secrets and variables → Actions:

| Secret Name | Value |
|-------------|-------|
| `YC_CLOUD_ID` | ID облака |
| `YC_FOLDER_ID` | ID каталога |
| `YC_REGISTRY_ID` | ID реестра |
| `YC_ACCESS_KEY_ID` | Из `access-key.json` → `access_key.key_id` |
| `YC_SECRET_ACCESS_KEY` | Из `access-key.json` → `secret` |
| `APP_DOMAIN` | Домен приложения (после первого развертывания) |

### Шаг 5: Обновленный GitHub Actions workflow

Замените содержимое `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Yandex Cloud

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
    types: [closed]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd frontend && npm ci
        cd ../backend && npm ci
    
    - name: Run linting
      run: |
        npm run lint
        cd frontend && npm run lint
        cd ../backend && npm run lint
    
    - name: Run tests
      run: |
        cd frontend && npm test -- --coverage --watchAll=false
        cd ../backend && npm test -- --coverage --watchAll=false
    
    - name: Build frontend
      run: |
        cd frontend && npm run build
    
    - name: Build backend
      run: |
        cd backend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Configure Yandex Cloud credentials
      run: |
        mkdir -p ~/.aws
        cat << EOF > ~/.aws/credentials
        [default]
        aws_access_key_id = ${{ secrets.YC_ACCESS_KEY_ID }}
        aws_secret_access_key = ${{ secrets.YC_SECRET_ACCESS_KEY }}
        EOF
        
        cat << EOF > ~/.aws/config
        [default]
        region = ru-central1
        EOF
    
    - name: Login to Yandex Cloud Registry
      run: |
        docker login \
          --username iam \
          --password ${{ secrets.YC_SECRET_ACCESS_KEY }} \
          cr.yandex.io
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          cr.yandex.io/${{ secrets.YC_REGISTRY_ID }}/sinshell:latest
          cr.yandex.io/${{ secrets.YC_REGISTRY_ID }}/sinshell:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Deploy to Yandex Cloud
      run: |
        # Установка Yandex CLI
        curl https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
        export PATH=$HOME/.yandex/cloud/bin:$PATH
        
        # Аутентификация через access key
        yc config profile create ci-cd
        yc config set access-key ${{ secrets.YC_ACCESS_KEY_ID }}
        yc config set secret-key ${{ secrets.YC_SECRET_ACCESS_KEY }}
        yc config set cloud-id ${{ secrets.YC_CLOUD_ID }}
        yc config set folder-id ${{ secrets.YC_FOLDER_ID }}
        
        # Обновление приложения
        yc serverless container update \
          --name sinshell-app \
          --image cr.yandex.io/${{ secrets.YC_REGISTRY_ID }}/sinshell:${{ github.sha }} \
          --port 80 \
          --memory 256M \
          --cores 1 \
          --execution-timeout 30s \
          --environment NODE_ENV=production \
          --environment PORT=5000 \
          --environment HOST=0.0.0.0 \
          --environment NEXT_PUBLIC_API_URL=https://${{ secrets.APP_DOMAIN }} \
          --environment NEXT_PUBLIC_APP_NAME=SinShell \
          --environment LOG_LEVEL=info \
          --min-instances 0 \
          --max-instances 5
    
    - name: Notify deployment
      if: always()
      run: |
        if [ "${{ job.status }}" == "success" ]; then
          echo "✅ Deployment to Yandex Cloud completed successfully!"
          echo "🌐 Your app is available at: https://${{ secrets.APP_DOMAIN }}"
        else
          echo "❌ Deployment failed!"
          exit 1
        fi
```

## 🚀 Альтернативный способ: UI сборка в Yandex Cloud

Если GitHub Actions тоже не работает, используйте UI сборку:

### 1. Настройка автоматической сборки в консоли

1. **Container Registry** → ваш реестр
2. **Репозитории** → **"Создать репозиторий"**
3. **Название**: `sinshell`
4. **Настройте сборку**:
   - **Тип сборки**: "Автоматическая"
   - **Источник**: GitHub
   - **Репозиторий**: ваш репозиторий
   - **Триггер**: Push в main

### 2. Ручное обновление приложения

```bash
# После каждой сборки обновляйте приложение
yc serverless container deploy \
  --name sinshell-app \
  --image cr.yandex.io/$REGISTRY_ID/sinshell:latest \
  --port 80 \
  --memory 256M \
  --cores 1
```

## 📊 Мониторинг

### Проверка статуса сборки
```bash
# Просмотр сборок
yc container repository list-build-history --repository-name cr.yandex.io/$REGISTRY_ID/sinshell

# Просмотр логов сборки
yc container repository list-build-history --repository-name cr.yandex.io/$REGISTRY_ID/sinshell --format json | jq -r '.[0].id' | xargs yc container repository get-build-log --repository-name cr.yandex.io/$REGISTRY_ID/sinshell
```

### Проверка приложения
```bash
# Статус приложения
yc serverless container get --name sinshell-app

# Логи приложения
yc serverless container logs --name sinshell-app --follow
```

## 🆘 Решение проблем

### ❌ DNS проблемы
**Решение**: Используйте GitHub Actions или UI сборку - они работают в облаке с правильным DNS

### ❌ Проблемы с доступом
**Решение**: Используйте статические ключи доступа вместо IAM токенов

### ❌ Ошибка сборки
**Решение**: Проверьте Dockerfile и зависимости локально:
```bash
docker build -t test .
docker run -p 8080:80 test
```

## 💡 Преимущества этого способа

✅ **Работает везде** - не зависит от локальной сети  
✅ **Без DNS проблем** - GitHub Actions имеют правильный DNS  
✅ **Безопасно** - использует статические ключи  
✅ **Автоматически** - CI/CD работает как обычно  
✅ **Надежно** - несколько вариантов развертывания  

---

**🎉 Этот способ решает проблемы с DNS и доступом к Yandex Cloud Registry!**