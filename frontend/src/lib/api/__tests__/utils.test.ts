/**
 * Тесты для API утилит
 */

import {
  ApiError,
  ApiErrorType,
  formatDuration,
  formatBytes,
  isNetworkError,
  isTimeoutError,
  isServerError,
  createLoadingIndicator,
  createProgressMessage,
} from '../utils';

describe('ApiError', () => {
  describe('constructor', () => {
    it('должен создаваться с базовыми параметрами', () => {
      const error = new ApiError('Test message', ApiErrorType.NETWORK_ERROR);
      
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Test message');
      expect(error.type).toBe(ApiErrorType.NETWORK_ERROR);
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('должен создаваться со всеми параметрами', () => {
      const details = { code: 'TEST_ERROR' };
      const error = new ApiError('Test message', ApiErrorType.SERVER_ERROR, 500, details);
      
      expect(error.message).toBe('Test message');
      expect(error.type).toBe(ApiErrorType.SERVER_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual(details);
    });
  });

  describe('static factory methods', () => {
    it('должен создавать сетевую ошибку', () => {
      const error = ApiError.network('Network failed');
      
      expect(error.type).toBe(ApiErrorType.NETWORK_ERROR);
      expect(error.message).toBe('Network failed');
      expect(error.statusCode).toBeUndefined();
    });

    it('должен создавать ошибку таймаута с сообщением по умолчанию', () => {
      const error = ApiError.timeout();
      
      expect(error.type).toBe(ApiErrorType.TIMEOUT_ERROR);
      expect(error.message).toBe('Request timeout');
    });

    it('должен создавать ошибку таймаута с кастомным сообщением', () => {
      const error = ApiError.timeout('Custom timeout');
      
      expect(error.type).toBe(ApiErrorType.TIMEOUT_ERROR);
      expect(error.message).toBe('Custom timeout');
    });

    it('должен создавать ошибку сервера', () => {
      const error = ApiError.server('Server error', 500);
      
      expect(error.type).toBe(ApiErrorType.SERVER_ERROR);
      expect(error.message).toBe('Server error');
      expect(error.statusCode).toBe(500);
    });

    it('должен создавать ошибку клиента', () => {
      const error = ApiError.client('Client error', 400);
      
      expect(error.type).toBe(ApiErrorType.CLIENT_ERROR);
      expect(error.message).toBe('Client error');
      expect(error.statusCode).toBe(400);
    });

    it('должен создавать ошибку парсинга', () => {
      const error = ApiError.parse('Parse error');
      
      expect(error.type).toBe(ApiErrorType.PARSE_ERROR);
      expect(error.message).toBe('Parse error');
      expect(error.statusCode).toBeUndefined();
    });

    it('должен создавать неизвестную ошибку', () => {
      const error = ApiError.unknown('Unknown error');
      
      expect(error.type).toBe(ApiErrorType.UNKNOWN_ERROR);
      expect(error.message).toBe('Unknown error');
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('getUserMessage', () => {
    it('должен возвращать сообщение для сетевой ошибки', () => {
      const error = ApiError.network('Network failed');
      expect(error.getUserMessage()).toBe('🌐 Проблемы с подключением к серверу. Проверьте интернет-соединение.');
    });

    it('должен возвращать сообщение для ошибки таймаута', () => {
      const error = ApiError.timeout();
      expect(error.getUserMessage()).toBe('⏱️ Сервер не ответил вовремя. Попробуйте еще раз.');
    });

    it('должен возвращать сообщение для ошибки сервера', () => {
      const error = ApiError.server('Server error', 500);
      expect(error.getUserMessage()).toBe('🔴 Внутренняя ошибка сервера. Попробуйте позже.');
    });

    it('должен возвращать сообщение для ошибки клиента 404', () => {
      const error = ApiError.client('Not found', 404);
      expect(error.getUserMessage()).toBe('❌ Запрошенный ресурс не найден.');
    });

    it('должен возвращать сообщение для ошибки клиента (не 404)', () => {
      const error = ApiError.client('Bad request', 400);
      expect(error.getUserMessage()).toBe('⚠️ Ошибка в запросе. Проверьте команду и попробуйте снова.');
    });

    it('должен возвращать сообщение для ошибки парсинга', () => {
      const error = ApiError.parse('Parse error');
      expect(error.getUserMessage()).toBe('📄 Ошибка обработки ответа сервера.');
    });

    it('должен возвращать сообщение для неизвестной ошибки', () => {
      const error = ApiError.unknown('Unknown error');
      expect(error.getUserMessage()).toBe('❓ Произошла неизвестная ошибка.');
    });
  });

  describe('getTechnicalMessage', () => {
    it('должен возвращать базовое сообщение', () => {
      const error = ApiError.network('Network failed');
      expect(error.getTechnicalMessage()).toBe('Network failed');
    });

    it('должен добавлять статус код', () => {
      const error = ApiError.server('Server error', 500);
      expect(error.getTechnicalMessage()).toBe('Server error (HTTP 500)');
    });

    it('должен добавлять детали', () => {
      const details = { code: 'TEST_ERROR' };
      const error = ApiError.network('Network failed', details);
      expect(error.getTechnicalMessage()).toBe('Network failed - {"code":"TEST_ERROR"}');
    });

    it('должен добавлять и статус код, и детали', () => {
      const details = { code: 'SERVER_ERROR' };
      const error = ApiError.server('Server error', 500, details);
      expect(error.getTechnicalMessage()).toBe('Server error (HTTP 500) - {"code":"SERVER_ERROR"}');
    });
  });
});

describe('formatDuration', () => {
  it('должен форматировать миллисекунды', () => {
    expect(formatDuration(500)).toBe('500мс');
    expect(formatDuration(999)).toBe('999мс');
  });

  it('должен форматировать секунды', () => {
    expect(formatDuration(1000)).toBe('1с');
    expect(formatDuration(5000)).toBe('5с');
    expect(formatDuration(59000)).toBe('59с');
  });

  it('должен форматировать минуты и секунды', () => {
    expect(formatDuration(60000)).toBe('1м 0с');
    expect(formatDuration(65000)).toBe('1м 5с');
    expect(formatDuration(120000)).toBe('2м 0с');
    expect(formatDuration(125000)).toBe('2м 5с');
  });
});

describe('formatBytes', () => {
  it('должен форматировать 0 байт', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('должен форматировать байты', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('должен форматировать килобайты', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(2048)).toBe('2 KB');
  });

  it('должен форматировать мегабайты', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1572864)).toBe('1.5 MB');
    expect(formatBytes(2097152)).toBe('2 MB');
  });

  it('должен форматировать гигабайты', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
    expect(formatBytes(1610612736)).toBe('1.5 GB');
  });
});

describe('error type checkers', () => {
  it('isNetworkError должен проверять сетевые ошибки', () => {
    const networkError = ApiError.network('Network failed');
    const serverError = ApiError.server('Server error', 500);
    const regularError = new Error('Regular error');

    expect(isNetworkError(networkError)).toBe(true);
    expect(isNetworkError(serverError)).toBe(false);
    expect(isNetworkError(regularError)).toBe(false);
  });

  it('isTimeoutError должен проверять ошибки таймаута', () => {
    const timeoutError = ApiError.timeout();
    const networkError = ApiError.network('Network failed');
    const regularError = new Error('Regular error');

    expect(isTimeoutError(timeoutError)).toBe(true);
    expect(isTimeoutError(networkError)).toBe(false);
    expect(isTimeoutError(regularError)).toBe(false);
  });

  it('isServerError должен проверять ошибки сервера', () => {
    const serverError = ApiError.server('Server error', 500);
    const clientError = ApiError.client('Client error', 400);
    const regularError = new Error('Regular error');

    expect(isServerError(serverError)).toBe(true);
    expect(isServerError(clientError)).toBe(false);
    expect(isServerError(regularError)).toBe(false);
  });
});

describe('createLoadingIndicator', () => {
  it('должен создавать индикатор с сообщением по умолчанию', () => {
    const indicator = createLoadingIndicator();
    expect(indicator).toMatch(/^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏] Загрузка\.\.\.$/);
  });

  it('должен создавать индикатор с кастомным сообщением', () => {
    const indicator = createLoadingIndicator('Обработка...');
    expect(indicator).toMatch(/^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏] Обработка\.\.\.$/);
  });
});

describe('createProgressMessage', () => {
  it('должен создавать сообщение о прогрессе с сообщением по умолчанию', () => {
    const message = createProgressMessage(5, 10);
    expect(message).toBe('📊 Загрузка: [██████████░░░░░░░░░░] 50% (5/10)');
  });

  it('должен создавать сообщение о прогрессе с кастомным сообщением', () => {
    const message = createProgressMessage(3, 4, 'Обработка');
    expect(message).toBe('📊 Обработка: [███████████████░░░░░] 75% (3/4)');
  });

  it('должен обрабатывать 0%', () => {
    const message = createProgressMessage(0, 10);
    expect(message).toBe('📊 Загрузка: [░░░░░░░░░░░░░░░░░░░░] 0% (0/10)');
  });

  it('должен обрабатывать 100%', () => {
    const message = createProgressMessage(10, 10);
    expect(message).toBe('📊 Загрузка: [████████████████████] 100% (10/10)');
  });

  it('должен корректно округлять проценты', () => {
    const message = createProgressMessage(1, 3);
    expect(message).toBe('📊 Загрузка: [███████░░░░░░░░░░░░░] 33% (1/3)');
  });
});