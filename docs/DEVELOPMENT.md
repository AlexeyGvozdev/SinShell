# Руководство по разработке SinShell

## Содержание

1. [Начало работы](#начало-работы)
2. [Структура проекта](#структура-проекта)
3. [Backend разработка](#backend-разработка)
4. [Frontend разработка](#frontend-разработка)
5. [Добавление новых команд](#добавление-новых-команд)
6. [Создание новых тем](#создание-новых-тем)
7. [Тестирование](#тестирование)
8. [Отладка](#отладка)
9. [Best Practices](#best-practices)

---

## Начало работы

### Требования

- Node.js 18.x или выше
- npm 9.x или выше
- Git
- Редактор кода (рекомендуется VS Code)

### Установка

1. **Клонирование репозитория**:
```bash
git clone <repository-url>
cd sinshell
```

2. **Установка зависимостей**:
```bash
npm run install:all
```

Эта команда установит зависимости для:
- Root проекта
- Frontend приложения
- Backend приложения

3. **Настройка переменных окружения**:

Backend (`.env` в папке `backend/`):
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

Frontend (`.env.local` в папке `frontend/`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Запуск в режиме разработки**:
```bash
npm run dev
```

Это запустит:
- Frontend на `http://localhost:3000`
- Backend на `http://localhost:5000`

---

## Структура проекта

### Backend структура

```
backend/
├── src/
│   ├── index.ts              # Точка входа
│   ├── app.ts                # Express приложение
│   ├── config/               # Конфигурация
│   │   └── index.ts
│   ├── routes/               # API маршруты
│   │   ├── index.ts
│   │   ├── health.ts
│   │   └── info.ts
│   ├── controllers/          # Контроллеры
│   │   └── infoController.ts
│   ├── middleware/           # Middleware
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   └── types/                # TypeScript типы
│       └── index.ts
├── package.json
└── tsconfig.json
```

### Frontend структура

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/           # React компоненты
│   │   └── Terminal/
│   │       ├── Terminal.tsx
│   │       ├── Input.tsx
│   │       ├── Output.tsx
│   │       └── Prompt.tsx
│   ├── lib/                  # Утилиты
│   │   ├── commands/
│   │   ├── api.ts
│   │   └── themes.ts
│   ├── context/              # React Context
│   │   ├── TerminalContext.tsx
│   │   └── ThemeContext.tsx
│   └── types/                # TypeScript типы
│       ├── terminal.ts
│       └── commands.ts
├── public/
├── config.json
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Backend разработка

### Создание нового endpoint

1. **Создайте контроллер** (`src/controllers/exampleController.ts`):

```typescript
import { Request, Response } from 'express';

export const getExample = async (req: Request, res: Response) => {
  try {
    const data = {
      message: 'Example data',
      timestamp: new Date().toISOString()
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};
```

2. **Создайте маршрут** (`src/routes/example.ts`):

```typescript
import { Router } from 'express';
import { getExample } from '../controllers/exampleController';

const router = Router();

router.get('/', getExample);

export default router;
```

3. **Зарегистрируйте маршрут** в `src/routes/index.ts`:

```typescript
import exampleRouter from './example';

router.use('/example', exampleRouter);
```

### Добавление middleware

Создайте файл в `src/middleware/`:

```typescript
import { Request, Response, NextFunction } from 'express';

export const customMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Ваша логика
  console.log(`${req.method} ${req.path}`);
  next();
};
```

Используйте в `src/app.ts`:

```typescript
import { customMiddleware } from './middleware/customMiddleware';

app.use(customMiddleware);
```

### Работа с TypeScript типами

Определите типы в `src/types/index.ts`:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SystemInfo {
  name: string;
  version: string;
  uptime: number;
}
```

Используйте в контроллерах:

```typescript
import { ApiResponse, SystemInfo } from '../types';

export const getInfo = async (
  req: Request, 
  res: Response<ApiResponse<SystemInfo>>
) => {
  const data: SystemInfo = {
    name: 'SinShell',
    version: '1.0.0',
    uptime: process.uptime()
  };
  
  res.json({
    success: true,
    data
  });
};
```

---

## Frontend разработка

### Создание нового компонента

1. **Создайте компонент** (`src/components/Example/Example.tsx`):

```typescript
'use client';

import React from 'react';

interface ExampleProps {
  title: string;
  onAction?: () => void;
}

export const Example: React.FC<ExampleProps> = ({ title, onAction }) => {
  return (
    <div className="example-container">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

2. **Экспортируйте** (`src/components/Example/index.ts`):

```typescript
export { Example } from './Example';
```

### Работа с Context API

1. **Создайте контекст** (`src/context/ExampleContext.tsx`):

```typescript
'use client';

import React, { createContext, useContext, useState } from 'react';

interface ExampleContextType {
  value: string;
  setValue: (value: string) => void;
}

const ExampleContext = createContext<ExampleContextType | undefined>(undefined);

export const ExampleProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [value, setValue] = useState('');

  return (
    <ExampleContext.Provider value={{ value, setValue }}>
      {children}
    </ExampleContext.Provider>
  );
};

export const useExample = () => {
  const context = useContext(ExampleContext);
  if (!context) {
    throw new Error('useExample must be used within ExampleProvider');
  }
  return context;
};
```

2. **Используйте в компонентах**:

```typescript
import { useExample } from '@/context/ExampleContext';

const MyComponent = () => {
  const { value, setValue } = useExample();
  
  return (
    <input 
      value={value} 
      onChange={(e) => setValue(e.target.value)} 
    />
  );
};
```

### API клиент

Создайте типизированный API клиент (`src/lib/api.ts`):

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export const api = new ApiClient(API_BASE_URL);
```

---

## Добавление новых команд

### Шаг 1: Определите интерфейс команды

В `src/types/commands.ts`:

```typescript
export interface Command {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[], context: CommandContext) => Promise<CommandOutput>;
}

export interface CommandContext {
  api: ApiClient;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  clear: () => void;
}

export interface CommandOutput {
  type: 'text' | 'html' | 'error';
  content: React.ReactNode;
}
```

### Шаг 2: Создайте команду

В `src/lib/commands/mycommand.ts`:

```typescript
import { Command, CommandContext, CommandOutput } from '@/types/commands';

export const myCommand: Command = {
  name: 'mycommand',
  description: 'Description of my command',
  usage: 'mycommand [options]',
  
  execute: async (args: string[], context: CommandContext): Promise<CommandOutput> => {
    try {
      // Ваша логика
      const result = await context.api.get('/endpoint');
      
      return {
        type: 'text',
        content: `Result: ${JSON.stringify(result)}`
      };
    } catch (error) {
      return {
        type: 'error',
        content: `Error: ${error.message}`
      };
    }
  }
};
```

### Шаг 3: Зарегистрируйте команду

В `src/lib/commands/index.ts`:

```typescript
import { myCommand } from './mycommand';

export const commands: Record<string, Command> = {
  help: helpCommand,
  about: aboutCommand,
  clear: clearCommand,
  theme: themeCommand,
  mycommand: myCommand, // Добавьте вашу команду
};

export const getCommand = (name: string): Command | undefined => {
  return commands[name.toLowerCase()];
};
```

---

## Создание новых тем

### Шаг 1: Определите тему

В `src/lib/themes.ts`:

```typescript
export interface Theme {
  name: string;
  colors: {
    background: string;
    foreground: string;
    cursor: string;
    selection: string;
    prompt: string;
    command: string;
    output: string;
    error: string;
  };
}

export const myTheme: Theme = {
  name: 'mytheme',
  colors: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    cursor: '#00ff00',
    selection: '#264f78',
    prompt: '#00aaff',
    command: '#ffffff',
    output: '#cccccc',
    error: '#ff0000'
  }
};
```

### Шаг 2: Зарегистрируйте тему

```typescript
export const themes: Record<string, Theme> = {
  default: defaultTheme,
  dracula: draculaTheme,
  monokai: monokaiTheme,
  nord: nordTheme,
  mytheme: myTheme, // Добавьте вашу тему
};

export const getTheme = (name: string): Theme => {
  return themes[name] || themes.default;
};
```

### Шаг 3: Примените тему в CSS

В `src/app/globals.css`:

```css
.terminal-container[data-theme="mytheme"] {
  background-color: #1a1a1a;
  color: #ffffff;
}

.terminal-container[data-theme="mytheme"] .terminal-prompt {
  color: #00aaff;
}

.terminal-container[data-theme="mytheme"] .terminal-cursor {
  background-color: #00ff00;
}
```

---

## Тестирование

### Backend тесты

Установите зависимости:
```bash
cd backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

Создайте тест (`src/__tests__/health.test.ts`):

```typescript
import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
  it('should return status ok', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
```

Запустите тесты:
```bash
npm test
```

### Frontend тесты

Установите зависимости:
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

Создайте тест (`src/components/Terminal/__tests__/Terminal.test.tsx`):

```typescript
import { render, screen } from '@testing-library/react';
import { Terminal } from '../Terminal';

describe('Terminal Component', () => {
  it('renders terminal prompt', () => {
    render(<Terminal />);
    const prompt = screen.getByText(/visitor@sinshell/i);
    expect(prompt).toBeInTheDocument();
  });
});
```

---

## Отладка

### Backend отладка

1. **Используйте VS Code debugger**:

Создайте `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    }
  ]
}
```

2. **Логирование**:

```typescript
import { logger } from './middleware/logger';

logger.info('Server started');
logger.error('Error occurred', { error });
```

### Frontend отладка

1. **React DevTools**: Установите расширение для браузера

2. **Console logging**:

```typescript
console.log('Component rendered', { props });
console.error('Error in component', error);
```

3. **Next.js debugging**:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Next.js: debug server-side",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "cwd": "${workspaceFolder}/frontend",
  "console": "integratedTerminal"
}
```

---

## Best Practices

### TypeScript

1. **Используйте строгую типизацию**:
```typescript
// ✅ Хорошо
const user: User = { name: 'John', age: 30 };

// ❌ Плохо
const user: any = { name: 'John', age: 30 };
```

2. **Определяйте интерфейсы для всех объектов**:
```typescript
interface Props {
  title: string;
  count: number;
}
```

### React

1. **Используйте функциональные компоненты**:
```typescript
// ✅ Хорошо
const Component: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};
```

2. **Мемоизируйте дорогие вычисления**:
```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

3. **Используйте useCallback для функций**:
```typescript
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Express

1. **Обрабатывайте ошибки**:
```typescript
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

2. **Валидируйте входные данные**:
```typescript
const validateInput = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  next();
};
```

### Git

1. **Используйте осмысленные commit messages**:
```bash
git commit -m "feat: add new command for listing projects"
git commit -m "fix: resolve terminal input focus issue"
git commit -m "docs: update API documentation"
```

2. **Создавайте feature branches**:
```bash
git checkout -b feature/new-command
git checkout -b fix/terminal-bug
```

---

## Полезные команды

### Разработка

```bash
# Запуск всего проекта
npm run dev

# Запуск только frontend
npm run dev:frontend

# Запуск только backend
npm run dev:backend

# Сборка проекта
npm run build

# Запуск production версии
npm start
```

### Линтинг и форматирование

```bash
# Frontend
cd frontend
npm run lint
npm run format

# Backend
cd backend
npm run lint
npm run format
```

### Тестирование

```bash
# Все тесты
npm test

# Тесты с покрытием
npm run test:coverage

# Watch mode
npm run test:watch
```

---

**Версия документа**: 1.0  
**Дата создания**: 2026-01-23  
**Автор**: Architect Mode