/**
 * Тесты для парсера команд
 */

import { DefaultCommandParser } from '../parser';

describe('DefaultCommandParser', () => {
  let parser: DefaultCommandParser;

  beforeEach(() => {
    parser = new DefaultCommandParser();
  });

  describe('parse', () => {
    it('должен парсить простую команду', () => {
      const result = parser.parse('help');
      expect(result).toEqual({
        command: 'help',
        args: [],
        flags: {},
      });
    });

    it('должен парсить команду с аргументами', () => {
      const result = parser.parse('theme dark');
      expect(result).toEqual({
        command: 'theme',
        args: ['dark'],
        flags: {},
      });
    });

    it('должен парсить команду с несколькими аргументами', () => {
      const result = parser.parse('git commit message');
      expect(result).toEqual({
        command: 'git',
        args: ['commit', 'message'],
        flags: {},
      });
    });

    it('должен парсить флаги с двумя дефисами', () => {
      const result = parser.parse('command --flag');
      expect(result).toEqual({
        command: 'command',
        args: [],
        flags: { flag: true },
      });
    });

    it('должен парсить флаги со значениями', () => {
      const result = parser.parse('command --name=value');
      expect(result).toEqual({
        command: 'command',
        args: [],
        flags: { name: 'value' },
      });
    });

    it('должен парсить короткие флаги', () => {
      const result = parser.parse('ls -l');
      expect(result).toEqual({
        command: 'ls',
        args: [],
        flags: { l: true },
      });
    });

    it('должен парсить несколько коротких флагов', () => {
      const result = parser.parse('ls -la');
      expect(result).toEqual({
        command: 'ls',
        args: [],
        flags: { l: true, a: true },
      });
    });

    it('должен парсить короткий флаг со значением', () => {
      const result = parser.parse('git commit -m message');
      expect(result).toEqual({
        command: 'git',
        args: ['commit'],
        flags: { m: 'message' },
      });
    });

    it('должен парсить команду с аргументами и флагами', () => {
      const result = parser.parse('command arg1 --flag1 arg2 -f');
      expect(result).toEqual({
        command: 'command',
        args: ['arg1', 'arg2'],
        flags: { flag1: true, f: true },
      });
    });

    it('должен обрабатывать кавычки', () => {
      const result = parser.parse('echo "hello world"');
      expect(result).toEqual({
        command: 'echo',
        args: ['hello world'],
        flags: {},
      });
    });

    it('должен обрабатывать одинарные кавычки', () => {
      const result = parser.parse("echo 'hello world'");
      expect(result).toEqual({
        command: 'echo',
        args: ['hello world'],
        flags: {},
      });
    });

    it('должен обрабатывать пустую строку', () => {
      const result = parser.parse('');
      expect(result).toEqual({
        command: '',
        args: [],
        flags: {},
      });
    });

    it('должен обрабатывать строку с пробелами', () => {
      const result = parser.parse('   ');
      expect(result).toEqual({
        command: '',
        args: [],
        flags: {},
      });
    });

    it('должен обрабатывать множественные пробелы', () => {
      const result = parser.parse('command    arg1    arg2');
      expect(result).toEqual({
        command: 'command',
        args: ['arg1', 'arg2'],
        flags: {},
      });
    });

    it('должен обрабатывать сложные команды', () => {
      const result = parser.parse('git commit -m "Initial commit" --author="John Doe" file.txt');
      expect(result).toEqual({
        command: 'git',
        args: ['commit', 'file.txt'],
        flags: {
          m: 'Initial commit',
          author: 'John Doe',
        },
      });
    });
  });
});