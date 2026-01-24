/**
 * Утилиты для работы с API
 */

/**
 * Типы ошибок API
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Класс для ошибок API
 */
export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode?: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.UNKNOWN_ERROR,
    statusCode?: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }

  /**
   * Создает ошибку сети
   */
  static network(message: string, details?: unknown): ApiError {
    return new ApiError(message, ApiErrorType.NETWORK_ERROR, undefined, details);
  }

  /**
   * Создает ошибку таймаута
   */
  static timeout(message: string = 'Request timeout'): ApiError {
    return new ApiError(message, ApiErrorType.TIMEOUT_ERROR);
  }

  /**
   * Создает ошибку сервера
   */
  static server(message: string, statusCode: number, details?: unknown): ApiError {
    return new ApiError(message, ApiErrorType.SERVER_ERROR, statusCode, details);
  }

  /**
   * Создает ошибку клиента
   */
  static client(message: string, statusCode: number, details?: unknown): ApiError {
    return new ApiError(message, ApiErrorType.CLIENT_ERROR, statusCode, details);
  }

  /**
   * Создает ошибку парсинга
   */
  static parse(message: string, details?: unknown): ApiError {
    return new ApiError(message, ApiErrorType.PARSE_ERROR, undefined, details);
  }

  /**
   * Создает неизвестную ошибку
   */
  static unknown(message: string, details?: unknown): ApiError {
    return new ApiError(message, ApiErrorType.UNKNOWN_ERROR, undefined, details);
  }

  /**
   * Получает пользовательское сообщение об ошибке
   */
  getUserMessage(): string {
    switch (this.type) {
      case ApiErrorType.NETWORK_ERROR:
        return '🌐 Проблемы с подключением к серверу. Проверьте интернет-соединение.';
      case ApiErrorType.TIMEOUT_ERROR:
        return '⏱️ Сервер не ответил вовремя. Попробуйте еще раз.';
      case ApiErrorType.SERVER_ERROR:
        return '🔴 Внутренняя ошибка сервера. Попробуйте позже.';
      case ApiErrorType.CLIENT_ERROR:
        if (this.statusCode === 404) {
          return '❌ Запрошенный ресурс не найден.';
        }
        return '⚠️ Ошибка в запросе. Проверьте команду и попробуйте снова.';
      case ApiErrorType.PARSE_ERROR:
        return '📄 Ошибка обработки ответа сервера.';
      default:
        return '❓ Произошла неизвестная ошибка.';
    }
  }

  /**
   * Получает техническое сообщение об ошибке
   */
  getTechnicalMessage(): string {
    let message = this.message;
    if (this.statusCode) {
      message += ` (HTTP ${this.statusCode})`;
    }
    if (this.details) {
      message += ` - ${JSON.stringify(this.details)}`;
    }
    return message;
  }
}

/**
 * Форматирует время в человекочитаемый формат
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}мс`;
  }
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}с`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}м ${remainingSeconds}с`;
};

/**
 * Форматирует размер данных
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Проверяет, является ли ошибка ошибкой сети
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof ApiError && error.type === ApiErrorType.NETWORK_ERROR;
};

/**
 * Проверяет, является ли ошибка ошибкой таймаута
 */
export const isTimeoutError = (error: unknown): boolean => {
  return error instanceof ApiError && error.type === ApiErrorType.TIMEOUT_ERROR;
};

/**
 * Проверяет, является ли ошибка ошибкой сервера
 */
export const isServerError = (error: unknown): boolean => {
  return error instanceof ApiError && error.type === ApiErrorType.SERVER_ERROR;
};

/**
 * Создает индикатор загрузки
 */
export const createLoadingIndicator = (message: string = 'Загрузка...'): string => {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const frame = frames[Math.floor(Date.now() / 100) % frames.length];
  return `${frame} ${message}`;
};

/**
 * Создает сообщение о прогрессе
 */
export const createProgressMessage = (current: number, total: number, message: string = 'Загрузка'): string => {
  const percentage = Math.round((current / total) * 100);
  const barLength = 20;
  const filledLength = Math.round((percentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  return `📊 ${message}: [${bar}] ${percentage}% (${current}/${total})`;
};