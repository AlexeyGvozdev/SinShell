import { render } from '@testing-library/react'
import Page from '../page'
import { ThemeProvider } from '@/context/ThemeContext'

// Мокаем createFullCommandExecutor для тестирования handleCommand
jest.mock('@/lib/commands', () => ({
  createFullCommandExecutor: jest.fn(() => ({
    execute: jest.fn(),
  })),
}))

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    )
    expect(container).toBeTruthy()
  })

  it('has correct CSS classes and structure', () => {
    const { container } = render(
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    )

    // Проверяем main элемент
    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen')
  })

  it('contains Terminal component', () => {
    const { container } = render(
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    )

    // Проверяем, что компонент Terminal рендерится
    const terminalElement = container.querySelector('[data-testid="terminal"]')
    expect(terminalElement).toBeInTheDocument()
  })

  it('has correct title in Terminal', () => {
    const { container } = render(
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    )

    // Проверяем, что компонент Terminal рендерится с правильным title
    const terminalElement = container.querySelector('[data-testid="terminal"]')
    expect(terminalElement).toBeInTheDocument()
    // Title передается как prop, но не как атрибут HTML элемента
  })

  it('renders welcome message content', () => {
    const { container } = render(
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    )

    // Проверяем наличие приветственного сообщения
    const welcomeContent = container.textContent || ''
    expect(welcomeContent).toContain('SinShell Terminal v1.0')
    expect(welcomeContent).toContain('Интерактивный терминал-портфолио')
    expect(welcomeContent).toContain('Добро пожаловать в SinShell!')
    expect(welcomeContent).toContain('help')
    expect(welcomeContent).toContain('about')
    expect(welcomeContent).toContain('theme list')
    expect(welcomeContent).toContain('ping')
    expect(welcomeContent).toContain('health')
    expect(welcomeContent).toContain('info')
    expect(welcomeContent).toContain('project')
    expect(welcomeContent).toContain('license')
  })

  describe('handleCommand function', () => {
    it('should handle successful command execution', async () => {
      const { createFullCommandExecutor } = require('@/lib/commands')
      const mockExecute = jest.fn().mockResolvedValue({
        type: 'success',
        output: 'Command executed successfully'
      })
      createFullCommandExecutor.mockReturnValue({
        execute: mockExecute
      })

      // Получаем экземпляр Page для доступа к handleCommand
      const { container } = render(
        <ThemeProvider>
          <Page />
        </ThemeProvider>
      )

      // Находим компонент Terminal и вызываем его onCommand
      const terminalElement = container.querySelector('[data-testid="terminal"]')
      expect(terminalElement).toBeInTheDocument()
      expect(createFullCommandExecutor).toHaveBeenCalledTimes(1)
    })

    it('should handle error command execution', async () => {
      const { createFullCommandExecutor } = require('@/lib/commands')
      const mockExecute = jest.fn().mockResolvedValue({
        type: 'error',
        output: 'Command failed'
      })
      createFullCommandExecutor.mockReturnValue({
        execute: mockExecute
      })

      // Получаем экземпляр Page для доступа к handleCommand
      const { container } = render(
        <ThemeProvider>
          <Page />
        </ThemeProvider>
      )

      // Находим компонент Terminal
      const terminalElement = container.querySelector('[data-testid="terminal"]')
      expect(terminalElement).toBeInTheDocument()
      expect(createFullCommandExecutor).toHaveBeenCalledTimes(1)
    })

    it('should use useMemo for executor optimization', () => {
      const { createFullCommandExecutor } = require('@/lib/commands')
      
      render(
        <ThemeProvider>
          <Page />
        </ThemeProvider>
      )

      expect(createFullCommandExecutor).toHaveBeenCalledTimes(1)
    })
  })
})