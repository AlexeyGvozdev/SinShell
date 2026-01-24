# Git Workflow - Правила работы с Git

## Обзор

Этот документ описывает правила и последовательности работы с Git в проекте SinShell. Цель - поддерживать чистую историю коммитов и эффективную командную работу.

## Ветвление

### Основные ветки

```
main          ← Продакшн версия (только релизы)
develop       ← Версия для разработки (основная ветка разработки)
feature/*     ← Ветки для новых фич
bugfix/*      ← Ветки для исправлений багов
hotfix/*      ← Ветки для срочных исправлений в проде
release/*     ← Ветки для подготовки релизов
```

### Правила ветвления

1. **main** - только стабильные релизы
2. **develop** - основная ветка для разработки
3. **Все фичи** - в отдельных ветках от `develop`
4. **Никогда не работаем напрямую в main/develop**

## Последовательность действий для новой фичи

### 1. Начало работы над фичей

```bash
# 1. Убедиться, что мы в develop и она актуальна
git checkout develop
git pull origin develop

# 2. Создать новую ветку для фичи
git checkout -b feature/название-фичи

# 3. Проверить, что мы в правильной ветке
git branch  # должна показать * feature/название-фичи
```

### 2. В процессе разработки

```bash
# Регулярно сохраняем прогресс
git add .
git commit -m "feat: описание сделанного"

# Периодически синхронизируемся с develop (если есть изменения)
git fetch origin
git rebase origin/develop
```

### 3. Завершение работы над фичей

```bash
# 1. Финальная синхронизация с develop
git fetch origin
git rebase origin/develop

# 2. Пуш ветки в удаленный репозиторий
git push origin feature/название-фичи

# 3. Создание Pull Request в GitHub/GitLab
# (через веб-интерфейс)
```

## Правила именования веток

### Фичи
```
feature/terminal-interface
feature/user-authentication
feature/api-endpoints
feature/theme-system
```

### Исправления багов
```
bugfix/terminal-input-focus
bugfix/api-response-parsing
bugfix/theme-switching
```

### Срочные исправления
```
hotfix/security-vulnerability
hotfix/critical-bug-fix
```

### Релизы
```
release/v1.0.0
release/v1.1.0
```

## Правила коммитов

### Формат коммита

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Типы коммитов

- `feat` - новая функциональность
- `fix` - исправление бага
- `docs` - изменения в документации
- `style` - форматирование кода (без логических изменений)
- `refactor` - рефакторинг кода
- `test` - добавление тестов
- `chore` - рутинные задачи (обновление зависимостей, etc.)

### Примеры хороших коммитов

```bash
feat(terminal): add command history navigation
fix(api): resolve authentication token parsing
docs(readme): update installation instructions
style(terminal): fix code formatting
refactor(commands): extract command registry logic
test(api): add integration tests for endpoints
chore(deps): update react to v18.2.0
```

### Правила для subject

1. **На русском языке** - все коммиты на русском
2. **Маленькими буквами** после типа
3. **Без точки в конце**
4. **Максимальная длина** - 50 символов

### Правила для body (опционально)

1. **Разделить на абзацы** пустой строкой
2. **Максимальная длина строки** - 72 символа
3. **Объяснить ЧТО и ПОЧЕМУ**, а не КАК

### Пример полного коммита

```bash
feat(terminal): add command history navigation

Добавлена возможность навигации по истории команд
с помощью стрелок вверх/вниз. История сохраняется
в localStorage и восстанавливается при перезагрузке.

- Добавлен useHistory hook
- Реализована навигация клавишами
- Добавлена фильтрация истории

Closes #123
```

## Pull Request (PR) правила

### Название PR

```
<type>(<scope>): <subject>
```

Такой же формат как у коммитов.

### Описание PR

```markdown
## Описание
Краткое описание изменений.

## Изменения
- [ ] Изменение 1
- [ ] Изменение 2
- [ ] Изменение 3

## Тестирование
- [ ] Тесты написаны
- [ ] Ручное тестирование пройдено
- [ ] Работает в Chrome/Firefox/Safari

## Скриншоты (если нужно)
![скриншот](url)

## Связанные задачи
Closes #123
```

### Процесс ревью

1. **Создать PR** из feature ветки в develop
2. **Добавить ревьюверов** (минимум 1)
3. **Пройти CI/CD проверки**
4. **Учтены все комментарии**
5. **Слить PR** в develop
6. **Удалить feature ветку**

## Ежедневная работа

### Начало рабочего дня

```bash
# 1. Переключиться на develop
git checkout develop

# 2. Получить последние изменения
git pull origin develop

# 3. Переключиться на свою ветку
git checkout feature/моя-фича

# 4. Синхронизировать с develop
git rebase develop
```

### Конец рабочего дня

```bash
# 1. Сохранить все изменения
git add .
git commit -m "feat: описание прогресса"

# 2. Запушить в удаленный репозиторий
git push origin feature/моя-фича

# 3. Проверить статус
git status
```

## Решение конфликтов

### Конфликт при rebase

```bash
# 1. Начать rebase
git rebase develop

# 2. Если есть конфликты - решить их
# (открыть файлы, исправить конфликты)

# 3. Добавить исправленные файлы
git add <файлы с конфликтами>

# 4. Продолжить rebase
git rebase --continue

# 5. Если нужно прервать
git rebase --abort
```

### Конфликт при merge

```bash
# 1. Начать merge
git merge develop

# 2. Решить конфликты в файлах

# 3. Добавить файлы
git add <файлы с конфликтами>

# 4. Завершить merge
git commit
```

## Запрещенные операции

### ❌ Никогда не делать

```bash
# Никогда не пушить напрямую в main/develop
git push origin main
git push origin develop

# Никогда не делать force push в общие ветки
git push --force origin develop
git push --force origin main

# Никогда не делать коммиты с секретами
git commit -m "feat: add api key"  # если в коде есть ключи
```

### ✅ Разрешенные force push

```bash
# Только в своей feature ветке
git push --force origin feature/моя-фича

# Или безопаснее
git push --force-with-lease origin feature/моя-фича
```

## Полезные алиасы

Добавьте в `~/.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --decorate --all
    last = log -1 HEAD
    unstage = reset HEAD --
    amend = commit --amend
    save = stash push
    pop = stash pop
```

## Чеклист перед коммитом

### Перед каждым коммитом

- [ ] Код отформатирован
- [ ] Нет console.log/debugger
- [ ] Тесты проходят
- [ ] Линтер не ругается
- [ ] Сообщение коммита соответствует правилам
- [ ] В коммите нет секретов/паролей

### Перед созданием PR

- [ ] Все коммиты логически сгруппированы
- [ ] Название PR соответствует правилам
- [ ] Описание PR заполнено
- [ ] Связанные задачи указаны
- [ ] Тесты написаны и проходят
- [ ] Документация обновлена

## Частые проблемы и решения

### Проблема: Забыл сделать pull перед работой

```bash
# Решение:
git fetch origin
git rebase origin/develop
```

### Проблема: Закоммитил в неправильную ветку

```bash
# Решение:
git checkout правильная-ветка
git cherry-pick <hash коммита>
git checkout неправильная-ветка
git reset --hard HEAD~1
```

### Проблема: Нужно изменить последний коммит

```bash
# Решение:
git add .
git commit --amend
# или
git commit --amend -m "новое сообщение"
```

### Проблема: Нужно объединить несколько коммитов

```bash
# Решение (объединить последние 3 коммита):
git rebase -i HEAD~3
# В редакторе выбрать squash для коммитов которые нужно объединить
```

## Автоматизация

### Pre-commit hooks

Установите husky для автоматической проверки:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

### GitHub Actions

Пример файла `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## Текущая ситуация в проекте

### Что мы делаем сейчас

1. **Создали ветку**: `feature/project-documentation`
2. **Добавили файлы**: вся папка `docs/`
3. **Готовы к коммиту**: файлы в индексе

### Следующие шаги

```bash
# 1. Сделать коммит
git commit -m "feat: добавлена полная документация проекта"

# 2. Запушить ветку
git push origin feature/project-documentation

# 3. Создать Pull Request в develop
# (через GitHub/GitLab интерфейс)
```

---

**Версия документа**: 1.0  
**Дата создания**: 2026-01-23  
**Автор**: Code Mode