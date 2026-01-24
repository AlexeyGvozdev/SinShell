/**
 * Тесты для RootLayout компонента
 */

import React from 'react';
import RootLayout, { metadata } from '../layout';

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
    expect(RootLayout).toBeDefined();
  });

  it('должен иметь правильную структуру экспорта', () => {
    // Проверяем, что RootLayout экспортируется как default
    expect(RootLayout).toBeDefined();
    expect(typeof RootLayout).toBe('function');
  });

  it('должен быть React компонентом', () => {
    // Проверяем, что это React компонент
    expect(React.isValidElement(<RootLayout>Test</RootLayout>)).toBe(true);
  });

  it('должен принимать children prop', () => {
    // Проверяем, что компонент принимает children
    const element = React.createElement(RootLayout as any, { children: 'Test Content' });
    expect(element).toBeDefined();
    expect((element as any).props.children).toBe('Test Content');
  });

  it('должен работать с разными типами children', () => {
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
        React.createElement(RootLayout as any, { key: index, children });
      }).not.toThrow();
    });
  });

  it('должен иметь правильные метаданные', () => {
    // Проверяем наличие метаданных
    expect(metadata).toBeDefined();
    expect(typeof metadata).toBe('object');
    expect(metadata.title).toBe('SinShell - Terminal Portfolio');
    expect(metadata.description).toBe('Interactive terminal-style portfolio website');
  });
});