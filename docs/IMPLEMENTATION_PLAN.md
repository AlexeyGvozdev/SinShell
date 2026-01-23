# План реализации SinShell

## Обзор

Этот документ содержит пошаговый план реализации проекта SinShell с детальным описанием каждого этапа и списком файлов, которые необходимо создать.

## Этапы реализации

### Этап 1: Backend - Базовая структура и конфигурация

**Цель**: Создать базовую структуру Express приложения с TypeScript

**Файлы для создания**:

1. **`backend/package.json`**
   - Зависимости: express, typescript, cors, dotenv, morgan
   - Dev зависимости: @types/node, @types/express, @types/cors, ts-node, nodemon
   - Scripts: dev, build, start

2. **`backend/tsconfig.json`**
   - Настройки TypeScript компилятора
   - Target: ES2020
   - Module: commonjs
   - OutDir: dist

3. **`backend/.env.example`**
   - Шаблон переменных окружения
   - PORT, NODE_ENV, CORS_ORIGIN

4. **`backend/src/config/index.ts`**
   - Конфигурация приложения
   - Чтение переменных окружения
   - Экспорт настроек

5. **`backend/src/types/index.ts`**
   - Общие TypeScript типы
   - Интерфейсы для API ответов
   - Типы для конфигурации

**Результат**: Базовая структура backend с конфигурацией

---

### Этап 2: Backend - Middleware и утилиты

**Цель**: Создать middleware для обработки запросов и ошибок

**Файлы для создания**:

1. **`backend/src/middleware/errorHandler.ts`**
   - Централизованная обработка ошибок
   - Форматирование ошибок для API
   - Логирование ошибок

2. **`backend/src/middleware/logger.ts`**
   - Настройка morgan для логирования
   - Кастомный формат логов
   - Условное логирование (dev/prod)

3. **`backend/src/middleware/cors.ts`**
   - Настройка CORS
   - Разрешенные origins
   - Разрешенные методы и заголовки

**Результат**: Middleware для обработки запросов

---

### Этап 3: Backend - API Endpoints

**Цель**: Реализовать основные API endpoints

**Файлы для создания**:

1. **`backend/src/controllers/healthController.ts`**
   - GET /api/health
   - Возвращает статус сервера

2. **`backend/src/controllers/infoController.ts`**
   - GET /api/info
   - Возвращает информацию о системе
   - Uptime, версия, окружение

3. **`backend/src/controllers/aboutController.ts`**
   - GET /api/about
   - Возвращает информацию о проекте
   - Автор, описание, ссылки

4. **`backend/src/routes/health.ts`**
   - Маршрут для health check

5. **`backend/src/routes/info.ts`**
   - Маршрут для system info

6. **`backend/src/routes/about.ts`**
   - Маршрут для about

7. **`backend/src/routes/index.ts`**
   - Главный роутер
   - Регистрация всех маршрутов

**Результат**: Работающие API endpoints

---

### Этап 4: Backend - Express приложение

**Цель**: Собрать все компоненты в единое приложение

**Файлы для создания**:

1. **`backend/src/app.ts`**
   - Создание Express приложения
   - Подключение middleware
   - Регистрация маршрутов
   - Обработка ошибок

2. **`backend/src/index.ts`**
   - Точка входа приложения
   - Запуск сервера
   - Обработка сигналов завершения

**Результат**: Полностью работающий backend сервер

---

### Этап 5: Frontend - Базовая структура Next.js

**Цель**: Создать базовую структуру Next.js приложения

**Файлы для создания**:

1. **`frontend/package.json`**
   - Зависимости: next, react, react-dom, typescript
   - Зависимости: tailwindcss, autoprefixer, postcss
   - Scripts: dev, build, start, lint

2. **`frontend/tsconfig.json`**
   - Настройки TypeScript для Next.js
   - Path aliases (@/*)
   - Strict mode

3. **`frontend/next.config.js`**
   - Конфигурация Next.js
   - Настройки сборки

4. **`frontend/tailwind.config.ts`**
   - Конфигурация Tailwind CSS
   - Кастомные цвета для терминала
   - Кастомные шрифты

5. **`frontend/postcss.config.js`**
   - Конфигурация PostCSS
   - Tailwind и autoprefixer

6. **`frontend/.env.local.example`**
   - Шаблон переменных окружения
   - NEXT_PUBLIC_API_URL

**Результат**: Базовая структура Next.js приложения

---

### Этап 6: Frontend - TypeScript типы

**Цель**: Определить все необходимые типы

**Файлы для создания**:

1. **`frontend/src/types/terminal.ts`**
   - TerminalState
   - HistoryEntry
   - TerminalConfig

2. **`frontend/src/types/commands.ts`**
   - Command interface
   - CommandContext
   - CommandOutput

3. **`frontend/src/types/theme.ts`**
   - Theme interface
   - ThemeColors

4. **`frontend/src/types/api.ts`**
   - API response types
   - Error types

**Результат**: Полный набор TypeScript типов

---

### Этап 7: Frontend - Система тем

**Цель**: Реализовать систему тем оформления

**Файлы для создания**:

1. **`frontend/src/lib/themes.ts`**
   - Определение всех тем
   - default, dracula, monokai, nord
   - Функции для работы с темами

2. **`frontend/src/context/ThemeContext.tsx`**
   - React Context для темы
   - Provider компонент
   - useTheme hook

**Результат**: Работающая система тем

---

### Этап 8: Frontend - API клиент

**Цель**: Создать типизированный API клиент

**Файлы для создания**:

1. **`frontend/src/lib/api.ts`**
   - ApiClient класс
   - Методы для всех endpoints
   - Обработка ошибок
   - Типизация ответов

**Результат**: API клиент для взаимодействия с backend

---

### Этап 9: Frontend - Система команд

**Цель**: Реализовать модульную систему команд

**Файлы для создания**:

1. **`frontend/src/lib/commands/help.ts`**
   - Команда help
   - Список всех доступных команд
   - Описание каждой команды

2. **`frontend/src/lib/commands/about.ts`**
   - Команда about
   - Запрос к API
   - Форматирование вывода

3. **`frontend/src/lib/commands/clear.ts`**
   - Команда clear
   - Очистка истории терминала

4. **`frontend/src/lib/commands/theme.ts`**
   - Команда theme
   - Переключение тем
   - Список доступных тем

5. **`frontend/src/lib/commands/index.ts`**
   - Регистр всех команд
   - Функция поиска команды
   - Парсинг команд

**Результат**: Полностью работающая система команд

---

### Этап 10: Frontend - Компоненты терминала

**Цель**: Создать UI компоненты терминала

**Файлы для создания**:

1. **`frontend/src/components/Terminal/Prompt.tsx`**
   - Отображение промпта
   - Стилизация под тему

2. **`frontend/src/components/Terminal/Input.tsx`**
   - Поле ввода команд
   - Обработка Enter
   - Автофокус

3. **`frontend/src/components/Terminal/Output.tsx`**
   - Отображение вывода команд
   - Поддержка разных типов вывода
   - Форматирование

4. **`frontend/src/components/Terminal/History.tsx`**
   - Отображение истории команд
   - Виртуализация для производительности

5. **`frontend/src/components/Terminal/Banner.tsx`**
   - ASCII art баннер
   - Приветственное сообщение

6. **`frontend/src/components/Terminal/Terminal.tsx`**
   - Главный компонент терминала
   - Управление состоянием
   - Координация всех подкомпонентов

7. **`frontend/src/components/Terminal/index.ts`**
   - Экспорт всех компонентов

**Результат**: Полный набор компонентов терминала

---

### Этап 11: Frontend - Terminal Context

**Цель**: Создать контекст для управления состоянием терминала

**Файлы для создания**:

1. **`frontend/src/context/TerminalContext.tsx`**
   - TerminalProvider
   - Управление историей команд
   - Выполнение команд
   - useTerminal hook

**Результат**: Централизованное управление состоянием терминала

---

### Этап 12: Frontend - Страницы и стили

**Цель**: Создать главную страницу и глобальные стили

**Файлы для создания**:

1. **`frontend/src/app/layout.tsx`**
   - Root layout
   - Подключение провайдеров
   - Метаданные

2. **`frontend/src/app/page.tsx`**
   - Главная страница
   - Рендер Terminal компонента

3. **`frontend/src/app/globals.css`**
   - Глобальные стили
   - Tailwind directives
   - Кастомные CSS для терминала
   - Стили для каждой темы

**Результат**: Готовая главная страница с терминалом

---

### Этап 13: Конфигурационные файлы

**Цель**: Создать конфигурационные файлы для приложения

**Файлы для создания**:

1. **`frontend/config.json`**
   - Конфигурация сайта
   - ASCII баннер
   - Социальные ссылки
   - Настройки API

2. **`frontend/public/favicon.ico`**
   - Иконка сайта

**Результат**: Конфигурация приложения

---

## Порядок выполнения

### Рекомендуемая последовательность:

1. **Backend сначала** (Этапы 1-4)
   - Позволяет протестировать API независимо
   - Можно использовать Postman/curl для тестирования

2. **Frontend типы и утилиты** (Этапы 5-9)
   - Создает фундамент для компонентов
   - Определяет контракты между частями приложения

3. **Frontend компоненты** (Этапы 10-12)
   - Собирает все вместе
   - Создает пользовательский интерфейс

4. **Конфигурация и финализация** (Этап 13)
   - Настройка и тонкая подстройка

### Альтернативный подход (параллельная разработка):

Если работают несколько разработчиков:

- **Разработчик 1**: Backend (Этапы 1-4)
- **Разработчик 2**: Frontend типы и система команд (Этапы 5-9)
- **Разработчик 3**: Frontend компоненты (Этапы 10-12)

---

## Чеклист для каждого этапа

Для каждого файла:

- [ ] Создан файл
- [ ] Добавлены необходимые импорты
- [ ] Реализована основная логика
- [ ] Добавлены TypeScript типы
- [ ] Добавлены комментарии к коду
- [ ] Проведено базовое тестирование
- [ ] Проверена интеграция с другими компонентами

---

## Критерии завершения

### Backend готов когда:
- ✅ Сервер запускается без ошибок
- ✅ Все endpoints отвечают корректно
- ✅ CORS настроен правильно
- ✅ Логирование работает
- ✅ Обработка ошибок функционирует

### Frontend готов когда:
- ✅ Приложение запускается без ошибок
- ✅ Терминал отображается корректно
- ✅ Все команды работают
- ✅ Темы переключаются
- ✅ API интеграция работает
- ✅ Стили применяются правильно

### Проект готов когда:
- ✅ Backend и Frontend работают вместе
- ✅ Все команды выполняются корректно
- ✅ Темы работают
- ✅ API запросы успешны
- ✅ Нет критических ошибок в консоли
- ✅ Документация актуальна

---

## Тестирование после каждого этапа

### Backend:
```bash
# Запуск сервера
cd backend
npm run dev

# Тестирование endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/info
curl http://localhost:5000/api/about
```

### Frontend:
```bash
# Запуск приложения
cd frontend
npm run dev

# Открыть в браузере
open http://localhost:3000

# Проверить команды в терминале
help
about
theme
clear
```

---

## Возможные проблемы и решения

### Backend:

**Проблема**: CORS ошибки
**Решение**: Проверить настройки CORS в `backend/src/middleware/cors.ts`

**Проблема**: Порт уже занят
**Решение**: Изменить PORT в `.env` или остановить процесс на порту

### Frontend:

**Проблема**: API запросы не работают
**Решение**: Проверить NEXT_PUBLIC_API_URL в `.env.local`

**Проблема**: Стили не применяются
**Решение**: Проверить Tailwind конфигурацию и импорт globals.css

**Проблема**: Команды не выполняются
**Решение**: Проверить регистрацию команд в `commands/index.ts`

---

## Следующие шаги после завершения

1. **Тестирование**
   - Написать unit тесты
   - Написать integration тесты
   - E2E тестирование

2. **Оптимизация**
   - Анализ производительности
   - Оптимизация bundle size
   - Кэширование

3. **Дополнительные функции**
   - История команд (↑/↓)
   - Автокомплит (Tab)
   - Новые команды

4. **Развертывание**
   - Настройка CI/CD
   - Развертывание на Vercel (frontend)
   - Развертывание на Railway (backend)

---

**Версия документа**: 1.0  
**Дата создания**: 2026-01-23  
**Автор**: Architect Mode