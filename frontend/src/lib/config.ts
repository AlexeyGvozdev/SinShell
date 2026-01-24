/**
 * Утилита для работы с конфигурацией приложения
 */

import type { AppConfig } from '@/types';
import configData from '../../config.json';

/**
 * Получить конфигурацию приложения
 */
export function getConfig(): AppConfig {
  return configData as AppConfig;
}

/**
 * Получить конфигурацию сайта
 */
export function getSiteConfig() {
  return getConfig().site;
}

/**
 * Получить конфигурацию терминала
 */
export function getTerminalConfig() {
  return getConfig().terminal;
}

/**
 * Получить социальные ссылки
 */
export function getSocialConfig() {
  return getConfig().social;
}

/**
 * Получить API конфигурацию
 */
export function getApiConfig() {
  return getConfig().api;
}

/**
 * Получить конфигурацию темы
 */
export function getThemeConfig() {
  return getConfig().theme;
}

/**
 * Получить промпт терминала
 */
export function getPrompt(): string {
  const { prompt } = getTerminalConfig();
  return `${prompt.user}@${prompt.host}:~${prompt.symbol}`;
}