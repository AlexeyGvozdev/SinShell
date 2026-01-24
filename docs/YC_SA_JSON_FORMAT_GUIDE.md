# 🛠️ Исправление ошибки JSON формата в YC_SA_JSON_CREDENTIALS

## ❌ Проблема
При запуске CI/CD пайплайна возникает ошибка:
```
Error: SyntaxError: No number after minus sign in JSON at position 1 (line 1 column 2)
```

## 🔍 Причина
Ошибка указывает на неправильный формат JSON в секрете `YC_SA_JSON_CREDENTIALS`. Это может быть вызвано:

1. **Лишние символы в начале файла** (BOM, тире, кавычки)
2. **Неправильное копирование** JSON из командной строки
3. **Недопустимые символы** в JSON
4. **Неправильное экранирование** кавычек

## ✅ Правильный формат JSON

### Шаг 1: Создание авторизованного ключа

```bash
# Создайте сервисный аккаунт (если еще не создан)
yc iam service-account create --name github-actions-deployer

# Создайте авторизованный ключ
yc iam key create \
  --service-account-name github-actions-deployer \
  --output key.json
```

### Шаг 2: Проверка содержимого key.json

**Правильный формат должен выглядеть так:**
```json
{
  "id": "aje1234567890abcdef",
  "service_account_id": "aje1234567890abcdef",
  "created_at": "2024-01-01T00:00:00Z",
  "key_algorithm": "RSA_2048",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

### Шаг 3: Проверка JSON на валидность

```bash
# Проверьте что JSON валиден
cat key.json | jq .

# Если jq не установлен, используйте Python
python3 -m json.tool key.json
```

### Шаг 4: Копирование в GitHub Secrets

1. Откройте файл `key.json` в текстовом редакторе
2. **Убедитесь что в начале файла нет лишних символов**
3. Скопируйте **весь** JSON (открывающая `{` до закрывающей `}`)
4. В GitHub репозитории: **Settings → Secrets and variables → Actions**
5. Создайте новый секрет `YC_SA_JSON_CREDENTIALS`
6. Вставьте JSON **без изменений**

## 🚨 Частые ошибки и решения

### Ошибка 1: Лишние символы в начале
**Неправильно:**
```
- {
  "id": "aje1234567890abcdef",
  ...
}
```

**Правильно:**
```json
{
  "id": "aje1234567890abcdef",
  ...
}
```

### Ошибка 2: Неправильное копирование из терминала
**Неправильно** (копирование с лишними символами):
```
$ yc iam key create --service-account-name github-actions-deployer --output key.json
{
  "id": "aje1234567890abcdef",
  ...
}
```

**Правильно** (копируйте только содержимое файла):
```bash
cat key.json
```

### Ошибка 3: Экранирование кавычек
**Неправильно** (двойное экранирование):
```json
{
  "id": \"aje1234567890abcdef\",
  ...
}
```

**Правильно:**
```json
{
  "id": "aje1234567890abcdef",
  ...
}
```

## 🔧 Автоматическое исправление

### Способ 1: Использование jq для очистки
```bash
# Очистка JSON от лишних символов
cat key.json | jq -c . > key_clean.json
```

### Способ 2: Использование Python
```bash
# Проверка и очистка JSON
python3 -c "import json; print(json.dumps(json.load(open('key.json'))))" > key_clean.json
```

### Способ 3: Ручная очистка в редакторе
1. Откройте `key.json` в VS Code
2. Удалите все символы до первой `{`
3. Убедитесь что после последней `}` нет символов
4. Сохраните файл

## 📋 Проверка перед использованием

### Проверка 1: Валидность JSON
```bash
# Должен вывести JSON без ошибок
cat key.json | jq .
```

### Проверка 2: Первые символы файла
```bash
# Должен показать только {
head -c 10 key.json
```

### Проверка 3: Последние символы файла
```bash
# Должен показать только }
tail -c 10 key.json
```

## 🆘 Если ошибка сохраняется

### Вариант 1: Пересоздать ключ
```bash
# Удалить старый ключ
yc iam key list --service-account-name github-actions-deployer

# Создать новый ключ
yc iam key create \
  --service-account-name github-actions-deployer \
  --output key_new.json
```

### Вариант 2: Использовать другой метод аутентификации
Вместо JSON ключа можно использовать IAM токен:

```yaml
# В .github/workflows/deploy.yml заменить:
yc-sa-json-credentials: ${{ secrets.YC_SA_JSON_CREDENTIALS }}

# На:
yc-iam-token: ${{ secrets.YC_IAM_TOKEN }}
```

**Или используйте готовый workflow с IAM токеном:**
Используйте файл [`.github/workflows/deploy-iam-token.yml`](../.github/workflows/deploy-iam-token.yml) вместо `deploy.yml`.

**Инструкция по настройке IAM токена:**
1. Получите IAM токен:
```bash
yc iam create-token
```

2. Добавьте токен в GitHub Secrets как `YC_IAM_TOKEN`

3. Используйте workflow с IAM токеном

**Преимущества IAM токена:**
- Проще в настройке
- Нет проблем с форматированием JSON
- Автоматическое обновление

**Недостатки IAM токена:**
- Временный (действителен ограниченное время)
- Требует регулярного обновления секрета

### Вариант 3: Проверить кодировку файла
```bash
# Проверить кодировку
file -I key.json

# Должно быть: key.json: application/json; charset=utf-8
```

## 📞 Дополнительная помощь

Если проблема сохраняется, проверьте:
1. **Документацию Yandex Cloud**: https://cloud.yandex.ru/docs/iam/operations/iam-token/create-for-sa
2. **GitHub Issues экшена**: https://github.com/yc-actions/yc-sls-container-deploy/issues
3. **Логи GitHub Actions** для детальной информации об ошибке

**🎯 Ключевой момент**: JSON должен начинаться с `{` и заканчиваться `}` без лишних символов!