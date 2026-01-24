import {
  defaultTheme,
  draculaTheme,
  monokaiTheme,
  nordTheme,
  themes,
  getTheme,
  getAvailableThemes,
  applyTheme,
} from '../themes';

describe('Theme system', () => {
  describe('Theme definitions', () => {
    it('default theme is defined correctly', () => {
      expect(defaultTheme.name).toBe('default');
      expect(defaultTheme.displayName).toBe('Default');
      expect(defaultTheme.colors).toBeDefined();
      expect(defaultTheme.colors.background).toBe('#000000');
      expect(defaultTheme.colors.foreground).toBe('#00ff00');
    });

    it('dracula theme is defined correctly', () => {
      expect(draculaTheme.name).toBe('dracula');
      expect(draculaTheme.displayName).toBe('Dracula');
      expect(draculaTheme.colors).toBeDefined();
    });

    it('monokai theme is defined correctly', () => {
      expect(monokaiTheme.name).toBe('monokai');
      expect(monokaiTheme.displayName).toBe('Monokai');
      expect(monokaiTheme.colors).toBeDefined();
    });

    it('nord theme is defined correctly', () => {
      expect(nordTheme.name).toBe('nord');
      expect(nordTheme.displayName).toBe('Nord');
      expect(nordTheme.colors).toBeDefined();
    });

    it('all themes have required color properties', () => {
      const requiredColors = [
        'background',
        'foreground',
        'cursor',
        'selection',
        'comment',
        'red',
        'green',
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white',
      ];

      Object.values(themes).forEach((theme) => {
        requiredColors.forEach((color) => {
          expect(theme.colors).toHaveProperty(color);
        });
      });
    });
  });

  describe('getTheme', () => {
    it('returns correct theme by name', () => {
      expect(getTheme('default')).toEqual(defaultTheme);
      expect(getTheme('dracula')).toEqual(draculaTheme);
      expect(getTheme('monokai')).toEqual(monokaiTheme);
      expect(getTheme('nord')).toEqual(nordTheme);
    });

    it('returns default theme for invalid name', () => {
      // @ts-expect-error Testing invalid theme name
      expect(getTheme('invalid')).toEqual(defaultTheme);
    });
  });

  describe('getAvailableThemes', () => {
    it('returns all available theme names', () => {
      const availableThemes = getAvailableThemes();
      expect(availableThemes).toContain('default');
      expect(availableThemes).toContain('dracula');
      expect(availableThemes).toContain('monokai');
      expect(availableThemes).toContain('nord');
      expect(availableThemes).toHaveLength(4);
    });
  });

  describe('applyTheme', () => {
    beforeEach(() => {
      // Mock document.documentElement
      document.documentElement.style.setProperty = jest.fn();
    });

    it('applies theme colors to CSS variables', () => {
      applyTheme(defaultTheme);

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--terminal-bg',
        defaultTheme.colors.background
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--terminal-fg',
        defaultTheme.colors.foreground
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--terminal-cursor',
        defaultTheme.colors.cursor
      );
    });

    it('applies all color properties', () => {
      applyTheme(draculaTheme);

      const setPropertyMock = document.documentElement.style.setProperty as jest.Mock;
      expect(setPropertyMock).toHaveBeenCalledTimes(12); // 12 color properties
    });
  });
});