# Настройка OIDC Федерации между GitHub Actions и Yandex Cloud

## Проблема
Ошибка при развертывании:
```
Error: {"error_description":"No matching federated credentials for specified service account, issuer and external subject","error":"invalid_client"}
Error: failed to get IAM token: request failed with status code 401
```

## Решение: Настройка Федеративных Учетных Данных

### Шаг 1: Подготовка в Yandex Cloud

1. **Войдите в Yandex Cloud консоль**
   - Перейдите в [Yandex Cloud Console](https://console.cloud.yandex.ru)
   - Выберите нужный каталог

2. **Создайте или используйте существующий сервисный аккаунт**
   - Перейдите в раздел **IAM & Admin** → **Service Accounts**
   - Убедитесь, что у сервисного аккаунта есть роли:
     - `serverless.containers.deployer`
     - `container-registry.images.puller`
     - `iam.serviceAccounts.user`

3. **Настройте федеративные учетные данные**
   - В разделе **Federations** создайте новую федерацию или используйте существующую
   - Настройте маппинг атрибутов для GitHub Actions

### Шаг 2: Настройка Федерации в Yandex Cloud Console

#### Вариант A: Через Консоль

1. **Создание федерации:**
   - Перейдите в **IAM & Admin** → **Federations**
   - Нажмите "Create federation"
   - Укажите:
     - **Name**: `github-actions-federation`
     - **Description**: Federation for GitHub Actions authentication
     - **Issuer**: `https://token.actions.githubusercontent.com`

2. **Настройка маппинга атрибутов:**
   ```json
   {
     "audience": ["https://github.com/your-username/your-repo"],
     "subject": "repo:your-username/your-repo:ref:refs/heads/develop"
   }
   ```

3. **Создание федеративных учетных данных:**
   - В настройках федерации перейдите в раздел "Federated users"
   - Создайте новую запись с параметрами:
     - **Name**: `github-actions-user`
     - **Federation**: Ваша федерация
     - **Name ID**: `https://github.com/your-username/your-repo`

#### Вариант B: Через YC CLI

```bash
# Создание федерации
yc iam federation create github-actions-federation \
  --organization-id <org-id> \
  --name "GitHub Actions Federation" \
  --description "Federation for GitHub Actions" \
  --issuer "https://token.actions.githubusercontent.com" \
  --sso-binding POST \
  --sso-url "https://token.actions.githubusercontent.com" \
  --cookie-max-age 12h

# Настройка федеративных учетных данных
yc iam federation saml create-user \
  --name github-actions-user \
  --federation-name github-actions-federation \
  --attribute name="https://github.com/your-username/your-repo"
```

### Шаг 3: Настройка GitHub Actions Workflow

Убедитесь, что ваш файл `.github/workflows/deploy-iam-token.yml` содержит правильные настройки:

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Get Yandex Cloud IAM token
        id: get-iam-token
        uses: docker://ghcr.io/yc-actions/yc-iam-token-fed:1.0.0
        with:
          yc-sa-id: ${{ secrets.YC_SA_ID }}

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          registry: cr.yandex
          username: iam
          password: ${{ steps.get-iam-token.outputs.token }}

      - name: Deploy Serverless Container (IAM Token)
        id: deploy-sls-container
        uses: yc-actions/yc-sls-container-deploy@v4
        with:
          yc-iam-token: ${{ steps.get-iam-token.outputs.token }}
          container-name: sinshell-app
          folder-id: ${{ secrets.YC_FOLDER_ID }}
          # ... остальные параметры
```

### Шаг 4: Альтернативное Решение (Временное)

Если настройка OIDC занимает много времени, можно временно использовать JSON credentials:

1. **Переименуйте workflow:**
   ```bash
   mv .github/workflows/deploy-iam-token.yml .github/workflows/deploy-iam-token.yml.backup
   ```

2. **Используйте основной workflow:**
   - Файл `.github/workflows/deploy.yml` использует JSON credentials
   - Убедитесь, что в GitHub Secrets установлены:
     - `YC_SA_JSON_CREDENTIALS`
     - `YC_FOLDER_ID`
     - `YC_SERVICE_ACCOUNT_ID`
     - `YC_REGISTRY_ID`
     - `APP_DOMAIN`

### Шаг 5: Проверка Настроек

1. **Проверьте федеративные учетные данные:**
   ```bash
   yc iam federation list
   yc iam federation saml list-users --federation-name github-actions-federation
   ```

2. **Тестирование аутентификации:**
   В GitHub Actions workflow используется специальный action для получения IAM токена:
   
   ```yaml
   - name: Get Yandex Cloud IAM token
     id: get-iam-token
     uses: docker://ghcr.io/yc-actions/yc-iam-token-fed:1.0.0
     with:
       yc-sa-id: ${{ secrets.YC_SA_ID }}
   ```
   
   Этот action автоматически получает OIDC токен от GitHub и обменивает его на IAM токен Yandex Cloud.

### Шаг 6: Отладка Ошибок

Если ошибка сохраняется:

1. **Проверьте issuer и subject:**
   - Убедитесь, что issuer точно соответствует `https://token.actions.githubusercontent.com`
   - Проверьте, что subject соответствует формату GitHub Actions

2. **Проверьте аудиторию (audience):**
   - В настройках федерации должна быть указана правильная аудитория

3. **Проверьте разрешения сервисного аккаунта:**
   ```bash
   yc iam service-account list-access-bindings <service-account-id>
   ```

## Дополнительные Ресурсы

- [Yandex Cloud OIDC Documentation](https://cloud.yandex.ru/docs/iam/concepts/authorization/oidc)
- [GitHub Actions OIDC Guide](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-cloud-providers)
- [Yandex Cloud Federation Guide](https://cloud.yandex.ru/docs/iam/operations/federations/)

## Важные Замечания

- Настройка OIDC федерации требует ручной конфигурации в Yandex Cloud консоли
- После настройки федерации, workflow с IAM токеном будет работать автоматически
- Для тестирования можно временно использовать JSON credentials через основной workflow
- Убедитесь, что все идентификаторы (folder-id, registry-id, service-account-id) корректны