# Настройка OIDC для GitHub Actions в Yandex Cloud

## Ошибка: "No matching federated credentials for specified service account"

Эта ошибка возникает, когда не настроены федеративные учетные данные OIDC между GitHub и Yandex Cloud.

## Решение 1: Настройка OIDC федерации (рекомендуемый способ)

### Шаг 1: Создание федерации в Yandex Cloud

```bash
# Создание федерации
yc iam federation create \
  --name github-federation \
  --organization-id <organization-id> \
  --issuer "https://token.actions.githubusercontent.com" \
  --sso-binding "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" \
  --cookie-max-age 12h
```

### Шаг 2: Настройка федеративных учетных данных

1. Перейдите в консоль Yandex Cloud
2. Откройте сервисный аккаунт
3. В разделе "Федеративные учетные данные" добавьте новую запись:
   - **Subject**: `repo:AlexeyGvozdev/SinShell:ref:refs/heads/develop`
   - **Issuer**: `https://token.actions.githubusercontent.com`

### Шаг 3: Назначение ролей федерации

```bash
# Назначение роли на сервисный аккаунт
yc resource-manager folder add-access-binding <folder-id> \
  --role editor \
  --subject federationAccount:<federation-id>
```

## Решение 2: Использование JSON credentials (временное решение)

Пока настраивается OIDC, можно использовать JSON credentials:

### Шаг 1: Создание сервисного аккаунта и ключа

```bash
# Создание сервисного аккаунта
yc iam service-account create --name sinshell-deployer

# Создание статического ключа
yc iam key create --service-account-name sinshell-deployer --output key.json
```

### Шаг 2: Настройка secrets в GitHub

1. Перейдите в репозиторий GitHub → Settings → Secrets and variables → Actions
2. Добавьте секреты:
   - `YC_SA_JSON_CREDENTIALS` - содержимое файла key.json
   - `YC_FOLDER_ID` - ID каталога
   - `YC_REGISTRY_ID` - ID реестра
   - `YC_SERVICE_ACCOUNT_ID` - ID сервисного аккаунта

### Шаг 3: Использование в workflow

Используйте файл `.github/workflows/deploy.yml` вместо `deploy-iam-token.yml`

## Решение 3: Альтернативный OIDC подход

### Использование yc-actions/yc-sls-container-deploy с OIDC

```yaml
- name: Deploy to Yandex Cloud
  uses: yc-actions/yc-sls-container-deploy@v4
  with:
    yc-oidc-provider: github
    yc-federation-id: <federation-id>
    yc-subject: repo:AlexeyGvozdev/SinShell:ref:refs/heads/develop
    container-name: sinshell-app
    folder-id: ${{ secrets.YC_FOLDER_ID }}
```

## Проверка настройки

### Проверка OIDC токена

```yaml
- name: Debug OIDC Token
  run: |
    echo "OIDC Token: ${{ steps.oidc.outputs.id-token }}"
```

### Проверка IAM токена

```bash
# Получение IAM токена через OIDC
yc iam create-token --federation-token
```

## Устранение неполадок

### Проверка федеративных учетных данных

```bash
# Просмотр федеративных учетных данных сервисного аккаунта
yc iam federation list
yc iam service-account get <service-account-id>
```

### Проверка issuer и subject

Убедитесь, что:
- Issuer: `https://token.actions.githubusercontent.com`
- Subject соответствует формату: `repo:owner/repo:ref:refs/heads/branch`

### Проверка прав доступа

```bash
# Проверка прав сервисного аккаунта
yc resource-manager folder list-access-bindings <folder-id>
```

## Дополнительные ресурсы

- [Документация Yandex Cloud по OIDC](https://yandex.cloud/ru/docs/iam/concepts/authorization/oidc)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-cloud-providers)