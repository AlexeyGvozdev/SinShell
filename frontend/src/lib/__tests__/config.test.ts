import {
  getConfig,
  getSiteConfig,
  getTerminalConfig,
  getSocialConfig,
  getApiConfig,
  getThemeConfig,
  getPrompt,
} from '../config';

describe('Config utilities', () => {
  describe('getConfig', () => {
    it('returns full configuration', () => {
      const config = getConfig();
      expect(config).toBeDefined();
      expect(config.site).toBeDefined();
      expect(config.terminal).toBeDefined();
      expect(config.social).toBeDefined();
      expect(config.api).toBeDefined();
      expect(config.theme).toBeDefined();
    });
  });

  describe('getSiteConfig', () => {
    it('returns site configuration', () => {
      const siteConfig = getSiteConfig();
      expect(siteConfig).toBeDefined();
      expect(siteConfig.title).toBe('SinShell');
      expect(siteConfig.version).toBe('1.0.0');
    });
  });

  describe('getTerminalConfig', () => {
    it('returns terminal configuration', () => {
      const terminalConfig = getTerminalConfig();
      expect(terminalConfig).toBeDefined();
      expect(terminalConfig.prompt).toBeDefined();
      expect(terminalConfig.welcomeMessage).toBeDefined();
      expect(terminalConfig.banner).toBeDefined();
    });
  });

  describe('getSocialConfig', () => {
    it('returns social configuration', () => {
      const socialConfig = getSocialConfig();
      expect(socialConfig).toBeDefined();
    });
  });

  describe('getApiConfig', () => {
    it('returns API configuration', () => {
      const apiConfig = getApiConfig();
      expect(apiConfig).toBeDefined();
      expect(apiConfig.baseUrl).toBe('/api');
    });
  });

  describe('getThemeConfig', () => {
    it('returns theme configuration', () => {
      const themeConfig = getThemeConfig();
      expect(themeConfig).toBeDefined();
      expect(themeConfig.default).toBe('default');
    });
  });

  describe('getPrompt', () => {
    it('returns formatted prompt string', () => {
      const prompt = getPrompt();
      expect(prompt).toBe('visitor@sinshell:~$');
    });

    it('includes user, host and symbol', () => {
      const prompt = getPrompt();
      expect(prompt).toContain('visitor');
      expect(prompt).toContain('sinshell');
      expect(prompt).toContain('$');
    });
  });
});