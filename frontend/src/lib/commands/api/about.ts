/**
 * API команды для получения информации о проекте
 */

import { CommandDefinition, CommandContext, CommandResult } from '@/types/command';
import { apiClient } from '@/lib/api';

/**
 * Команда для получения базовой информации о проекте
 */
export const aboutApiCommand: CommandDefinition = {
  name: 'about-api',
  description: 'Получить информацию о проекте с сервера',
  usage: 'about-api',
  examples: ['about-api'],
  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      const about = await apiClient.getAbout();
      
      const linksList = about.links.map(link => `  🔗 ${link.name}: ${link.url}`).join('\n');
      const techList = about.technologies.map(tech => `  • ${tech}`).join('\n');

      return {
        output: `📋 Информация о проекте:

🏷️ Название: ${about.title}
📝 Описание: ${about.description}
👤 Автор: ${about.version}
🔢 Версия: ${about.version}

🔗 Ссылки:
${linksList}

🛠️ Технологии:
${techList}`,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при получении информации о проекте: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для получения расширенной информации о проекте
 */
export const aboutExtendedCommand: CommandDefinition = {
  name: 'about-extended',
  description: 'Получить расширенную информацию о проекте',
  usage: 'about-extended',
  examples: ['about-extended'],
  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      const about = await apiClient.getExtendedAbout();
      
      const linksList = about.links.map(link => `  🔗 ${link.name}: ${link.url}`).join('\n');
      const techList = about.technologies.map(tech => `  • ${tech}`).join('\n');
      const featuresList = about.features.map(feature => `  ✨ ${feature}`).join('\n');
      const roadmapList = about.roadmap.map(item => `  🚀 ${item}`).join('\n');
      const contributorsList = about.contributors.map(contributor => 
        `  👤 ${contributor.name} - ${contributor.role}${contributor.url ? ` (${contributor.url})` : ''}`
      ).join('\n');

      return {
        output: `📋 Расширенная информация о проекте:

🏷️ Название: ${about.title}
📝 Описание: ${about.description}
👤 Автор: ${about.author}
🔢 Версия: ${about.version}

🔗 Ссылки:
${linksList}

🛠️ Технологии:
${techList}

✨ Возможности:
${featuresList}

🚀 Дорожная карта:
${roadmapList}

👥 Контрибьюторы:
${contributorsList}`,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при получении расширенной информации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для получения информации о лицензии
 */
export const licenseCommand: CommandDefinition = {
  name: 'license',
  description: 'Получить информацию о лицензии проекта',
  usage: 'license',
  examples: ['license'],
  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      const license = await apiClient.getLicense();
      
      const permissionsList = license.permissions.map(permission => `  ✅ ${permission}`).join('\n');
      const conditionsList = license.conditions.map(condition => `  ⚠️ ${condition}`).join('\n');
      const limitationsList = license.limitations.map(limitation => `  ❌ ${limitation}`).join('\n');

      let output = `📄 Лицензия: ${license.name} ${license.version}

📝 Описание: ${license.description}

✅ Разрешено:
${permissionsList}`;

      if (license.conditions.length > 0) {
        output += `

⚠️ Условия:
${conditionsList}`;
      }

      if (license.limitations.length > 0) {
        output += `

❌ Запрещено:
${limitationsList}`;
      }

      if (license.fullText) {
        output += `

📖 Полный текст лицензии доступен на официальном сайте`;
      }

      return {
        output,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при получении информации о лицензии: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для получения краткой сводки о проекте
 */
export const projectCommand: CommandDefinition = {
  name: 'project',
  description: 'Получить краткую сводку о проекте',
  usage: 'project',
  examples: ['project'],
  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      const [about, health] = await Promise.all([
        apiClient.getAbout(),
        apiClient.getHealth(),
      ]);

      const statusIcon = health.status === 'ok' ? '🟢' : '🔴';
      const statusText = health.status === 'ok' ? 'Работает' : 'Недоступен';

      return {
        output: `${statusIcon} SinShell ${about.version}

📝 ${about.description}
👤 Автор: ${about.author}
🔗 Проект: ${about.links.find(link => link.name === 'GitHub')?.url || 'Недоступна'}

Статус сервера: ${statusText}`,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при получении сводки о проекте: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};