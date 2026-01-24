# GitHub Actions

Этот проект использует GitHub Actions для автоматизации CI/CD процессов.

## Workflows

### 1. Backend Tests (`backend-tests.yml`)

Запускается при:
- Pull Request в ветки `develop` или `main` с изменениями в `backend/**`
- Push в ветки `develop` или `main` с изменениями в `backend/**`

**Что делает:**
- Запускает тесты на Node.js 18.x и 20.x
- Проверяет линтер (если настроен)
- Запускает все тесты
- Генерирует отчет о покрытии кода
- Загружает отчет в Codecov
- Комментирует PR с информацией о покрытии

**Требования для прохождения:**
- Все тесты должны пройти успешно
- Покрытие кода должно соответствовать порогам:
  - Statements: ≥90%
  - Functions: ≥90%
  - Lines: ≥90%
  - Branches: ≥60%

### 2. CI (`ci.yml`)

Общий CI workflow для всего проекта.

Запускается при:
- Pull Request в ветки `develop` или `main`
- Push в ветки `develop` или `main`

**Jobs:**

1. **lint-and-format** - Проверка форматирования кода
2. **backend-tests** - Запуск тестов backend с проверкой покрытия
3. **build-check** - Проверка сборки проекта и TypeScript компиляции

## Локальный запуск

Перед созданием PR рекомендуется локально запустить:

```bash
# Backend тесты
cd backend
npm test
npm run test:coverage

# TypeScript проверка
npx tsc --noEmit
```

## Badges

Добавьте в основной README.md:

```markdown
![Backend Tests](https://github.com/AlexeyGvozdev/SinShell/workflows/Backend%20Tests/badge.svg)
![CI](https://github.com/AlexeyGvozdev/SinShell/workflows/CI/badge.svg)
[![codecov](https://codecov.io/gh/AlexeyGvozdev/SinShell/branch/develop/graph/badge.svg)](https://codecov.io/gh/AlexeyGvozdev/SinShell)
```

## Настройка Codecov

Для работы с Codecov:

1. Зарегистрируйтесь на [codecov.io](https://codecov.io)
2. Подключите репозиторий SinShell
3. Токен будет автоматически использован через GitHub App

## Troubleshooting

### Тесты падают локально, но проходят в CI

Проверьте версию Node.js:
```bash
node --version  # Должна быть 18.x или 20.x
```

### Coverage не загружается в Codecov

Убедитесь, что:
- Репозиторий подключен к Codecov
- Файл `coverage/lcov.info` генерируется
- GitHub App имеет доступ к репозиторию