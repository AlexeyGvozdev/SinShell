/**
 * Парсер команд терминала
 */

import { CommandParser } from '@/types';

/**
 * Парсит строку команды на имя команды, аргументы и флаги
 * 
 * Примеры:
 * - "help" -> { command: "help", args: [], flags: {} }
 * - "theme dark" -> { command: "theme", args: ["dark"], flags: {} }
 * - "ls -la /home" -> { command: "ls", args: ["/home"], flags: { l: true, a: true } }
 * - "git commit -m 'message'" -> { command: "git", args: ["commit"], flags: { m: "message" } }
 */
export class DefaultCommandParser implements CommandParser {
  /**
   * Парсит строку команды
   */
  parse(input: string): {
    command: string;
    args: string[];
    flags: Record<string, boolean | string>;
  } {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return { command: '', args: [], flags: {} };
    }

    // Разбиваем на токены с учетом кавычек
    const tokens = this.tokenize(trimmed);
    
    if (tokens.length === 0) {
      return { command: '', args: [], flags: {} };
    }

    const command = tokens[0];
    const args: string[] = [];
    const flags: Record<string, boolean | string> = {};

    // Обрабатываем остальные токены
    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];

      // Флаг с двумя дефисами (--flag или --flag=value)
      if (token.startsWith('--')) {
        const flagPart = token.slice(2);
        const equalIndex = flagPart.indexOf('=');
        
        if (equalIndex > 0) {
          const flagName = flagPart.slice(0, equalIndex);
          const flagValue = flagPart.slice(equalIndex + 1);
          flags[flagName] = flagValue;
        } else {
          flags[flagPart] = true;
        }
      }
      // Флаг с одним дефисом (-f или -abc)
      else if (token.startsWith('-') && token.length > 1 && !token.startsWith('--')) {
        const flagChars = token.slice(1);
        
        // Если следующий токен не флаг, это значение для последнего флага
        const nextToken = tokens[i + 1];
        const hasValue = nextToken && !nextToken.startsWith('-');
        
        // Если только один символ и есть значение
        if (flagChars.length === 1 && hasValue) {
          flags[flagChars] = nextToken;
          i++; // Пропускаем следующий токен
        } else {
          // Несколько флагов подряд (-abc = -a -b -c)
          for (const char of flagChars) {
            flags[char] = true;
          }
        }
      }
      // Обычный аргумент
      else {
        args.push(token);
      }
    }

    return { command, args, flags };
  }

  /**
   * Разбивает строку на токены с учетом кавычек
   */
  private tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      // Начало или конец кавычек
      if ((char === '"' || char === "'") && (i === 0 || input[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        } else {
          current += char;
        }
      }
      // Пробел вне кавычек - разделитель токенов
      else if (char === ' ' && !inQuotes) {
        if (current) {
          tokens.push(current);
          current = '';
        }
      }
      // Обычный символ
      else {
        current += char;
      }
    }

    // Добавляем последний токен
    if (current) {
      tokens.push(current);
    }

    return tokens;
  }
}

/**
 * Экспортируем экземпляр парсера по умолчанию
 */
export const commandParser = new DefaultCommandParser();