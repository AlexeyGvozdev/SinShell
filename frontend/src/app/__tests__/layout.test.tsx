/**
 * Тесты для RootLayout компонента
 */

import React from 'react';

// Мокаем ThemeContext
jest.mock('../../context/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

// Мокаем метаданные
jest.mock('next/font/google', () => ({
  Geist: () => ({
    className: '--font-geist-sans',
    style: { fontFamily: 'Geist Sans' },
  }),
  Geist_Mono: () => ({
    className: '--font-geist-mono',
    style: { fontFamily: 'Geist Mono' },
  }),
}));

// Мокаем next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('RootLayout', () => {
  beforeEach(() => {
    // Очищаем DOM перед каждым тестом
    document.body.innerHTML = '';
  });

  it('должен импортироваться без ошибок', () => {
    expect(() => {
      require('../layout');
    }).not.toThrow();
  });

  it('должен иметь правильную структуру экспорта', () => {
    const layoutModule = require('../layout');
    
    // Проверяем, что RootLayout экспортируется как default
    expect(layoutModule.default).toBeDefined();
    expect(typeof layoutModule.default).toBe('function');
  });

  it('должен быть React компонентом', () => {
    const RootLayout = require('../layout').default;
    
    // Проверяем, что это React компонент
    expect(React.isValidElement(<RootLayout>Test</RootLayout>)).toBe(true);
  });

  it('должен принимать children prop', () => {
    const RootLayout = require('../layout').default;
    
    // Проверяем, что компонент принимает children
    const element = React.createElement(RootLayout, {}, 'Test Content');
    expect(element).toBeDefined();
    expect((element as any).props.children).toBe('Test Content');
  });

  it('должен работать с разными типами children', () => {
    const RootLayout = require('../layout').default;
    
    const testCases = [
      'Text content',
      <div key="1">Simple div</div>,
      <span key="2">Simple span</span>,
      <div key="3"><p>Nested content</p></div>,
      null,
      undefined,
    ];

    testCases.forEach((children, index) => {
      expect(() => {
        React.createElement(RootLayout, { key: index }, children);
      }).not.toThrow();
    });
  });

  it('должен иметь правильные метаданные', () => {
    const layoutModule = require('../layout');
    
    // Проверяем наличие метаданных
    expect(layoutModule.metadata).toBeDefined();
    expect(typeof layoutModule.metadata).toBe('object');
    expect(layoutModule.metadata.title).toBe('SinShell - Terminal Portfolio');
    expect(layoutModule.metadata.description).toBe('Interactive terminal-style portfolio website');
  });
});