/**
 * Реестр команд терминала
 */

import { CommandDefinition, CommandRegistry } from '@/types';

/**
 * Реализация реестра команд
 */
export class DefaultCommandRegistry implements CommandRegistry {
  public commands: Map<string, CommandDefinition>;
  private aliases: Map<string, string>; // alias -> command name

  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
  }

  /**
   * Регистрирует команду в реестре
   */
  register(command: CommandDefinition): void {
    // Регистрируем основное имя команды
    this.commands.set(command.name, command);

    // Регистрируем псевдонимы
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias, command.name);
      }
    }
  }

  /**
   * Отменяет регистрацию команды
   */
  unregister(name: string): void {
    const command = this.commands.get(name);
    
    if (command) {
      // Удаляем псевдонимы
      if (command.aliases) {
        for (const alias of command.aliases) {
          this.aliases.delete(alias);
        }
      }
      
      // Удаляем команду
      this.commands.delete(name);
    }
  }

  /**
   * Получает команду по имени или псевдониму
   */
  get(name: string): CommandDefinition | undefined {
    // Сначала проверяем прямое имя
    let command = this.commands.get(name);
    
    // Если не найдено, проверяем псевдонимы
    if (!command) {
      const realName = this.aliases.get(name);
      if (realName) {
        command = this.commands.get(realName);
      }
    }
    
    return command;
  }

  /**
   * Получает все зарегистрированные команды
   */
  getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  /**
   * Проверяет существование команды
   */
  has(name: string): boolean {
    return this.commands.has(name) || this.aliases.has(name);
  }

  /**
   * Очищает реестр
   */
  clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }

  /**
   * Получает количество зарегистрированных команд
   */
  get size(): number {
    return this.commands.size;
  }
}

/**
 * Глобальный экземпляр реестра команд
 */
export const commandRegistry = new DefaultCommandRegistry();