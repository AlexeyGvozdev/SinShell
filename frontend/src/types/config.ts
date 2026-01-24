/**
 * Типы для конфигурации приложения
 */

export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  version: string;
  repository?: string;
}

export interface PromptConfig {
  user: string;
  host: string;
  symbol: string;
}

export interface BannerConfig {
  enabled: boolean;
  text: string[];
}

export interface TerminalConfig {
  prompt: PromptConfig;
  welcomeMessage: string;
  banner: BannerConfig;
}

export interface SocialConfig {
  github?: string;
  linkedin?: string;
  email?: string;
  twitter?: string;
  website?: string;
}

export interface ApiConfig {
  baseUrl: string;
}

export interface ThemeConfig {
  default: string;
}

export interface AppConfig {
  site: SiteConfig;
  terminal: TerminalConfig;
  social: SocialConfig;
  api: ApiConfig;
  theme: ThemeConfig;
}