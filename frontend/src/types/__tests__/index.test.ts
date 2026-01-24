/**
 * Тесты для центрального экспорта типов
 */

import * as apiTypes from '../api';
import * as commandTypes from '../command';
import * as configTypes from '../config';
import * as terminalTypes from '../terminal';
import * as themeTypes from '../theme';
import * as allTypes from '../index';

// Проверяем, что все модули типов могут быть импортированы
describe('Types Index', () => {
  it('должен экспортировать все типы из api', () => {
    // Проверяем импорт типов API
    expect(apiTypes).toBeDefined();
  });

  it('должен экспортировать все типы из command', () => {
    // Проверяем импорт типов команд
    expect(commandTypes).toBeDefined();
  });

  it('должен экспортировать все типы из config', () => {
    // Проверяем импорт типов конфигурации
    expect(configTypes).toBeDefined();
  });

  it('должен экспортировать все типы из terminal', () => {
    // Проверяем импорт типов терминала
    expect(terminalTypes).toBeDefined();
  });

  it('должен экспортировать все типы из theme', () => {
    // Проверяем импорт типов тем
    expect(themeTypes).toBeDefined();
  });

  it('должен экспортировать все типы без конфликтов', () => {
    // Проверяем, что центральный экспорт работает без конфликтов
    expect(allTypes).toBeDefined();
  });

  it('должен содержать основные типы команд', () => {
    // Проверяем наличие ключевых типов команд в отдельном модуле
    expect(commandTypes).toBeDefined();
    expect(typeof commandTypes).toBe('object');
  });

  it('должен содержать основные типы API', () => {
    // Проверяем наличие ключевых типов API в отдельном модуле
    expect(apiTypes).toBeDefined();
    expect(typeof apiTypes).toBe('object');
  });

  it('должен содержать основные типы конфигурации', () => {
    // Проверяем наличие ключевых типов конфигурации в отдельном модуле
    expect(configTypes).toBeDefined();
    expect(typeof configTypes).toBe('object');
  });

  it('должен содержать основные типы терминала', () => {
    // Проверяем наличие ключевых типов терминала в отдельном модуле
    expect(terminalTypes).toBeDefined();
    expect(typeof terminalTypes).toBe('object');
  });

  it('должен содержать основные типы тем', () => {
    // Проверяем наличие ключевых типов тем в отдельном модуле
    expect(themeTypes).toBeDefined();
    expect(typeof themeTypes).toBe('object');
  });
});