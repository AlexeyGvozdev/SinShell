/**
 * Тесты для центрального экспорта типов
 */

// Проверяем, что все модули типов могут быть импортированы
describe('Types Index', () => {
  it('должен экспортировать все типы из api', () => {
    // Проверяем импорт типов API
    expect(() => {
      require('../api');
    }).not.toThrow();
  });

  it('должен экспортировать все типы из command', () => {
    // Проверяем импорт типов команд
    expect(() => {
      require('../command');
    }).not.toThrow();
  });

  it('должен экспортировать все типы из config', () => {
    // Проверяем импорт типов конфигурации
    expect(() => {
      require('../config');
    }).not.toThrow();
  });

  it('должен экспортировать все типы из terminal', () => {
    // Проверяем импорт типов терминала
    expect(() => {
      require('../terminal');
    }).not.toThrow();
  });

  it('должен экспортировать все типы из theme', () => {
    // Проверяем импорт типов тем
    expect(() => {
      require('../theme');
    }).not.toThrow();
  });

  it('должен экспортировать все типы без конфликтов', () => {
    // Проверяем, что центральный экспорт работает без конфликтов
    expect(() => {
      require('../index');
    }).not.toThrow();
  });

  it('должен содержать основные типы команд', () => {
    // Проверяем наличие ключевых типов команд в отдельном модуле
    const commandTypes = require('../command');
    expect(commandTypes).toBeDefined();
    expect(typeof commandTypes).toBe('object');
  });

  it('должен содержать основные типы API', () => {
    // Проверяем наличие ключевых типов API в отдельном модуле
    const apiTypes = require('../api');
    expect(apiTypes).toBeDefined();
    expect(typeof apiTypes).toBe('object');
  });

  it('должен содержать основные типы конфигурации', () => {
    // Проверяем наличие ключевых типов конфигурации в отдельном модуле
    const configTypes = require('../config');
    expect(configTypes).toBeDefined();
    expect(typeof configTypes).toBe('object');
  });

  it('должен содержать основные типы терминала', () => {
    // Проверяем наличие ключевых типов терминала в отдельном модуле
    const terminalTypes = require('../terminal');
    expect(terminalTypes).toBeDefined();
    expect(typeof terminalTypes).toBe('object');
  });

  it('должен содержать основные типы тем', () => {
    // Проверяем наличие ключевых типов тем в отдельном модуле
    const themeTypes = require('../theme');
    expect(themeTypes).toBeDefined();
    expect(typeof themeTypes).toBe('object');
  });
});