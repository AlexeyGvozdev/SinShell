/**
 * API модуль для взаимодействия с backend SinShell
 */

export { ApiClient, createApiClient, apiClient } from './client';
export * from '@/types/api';
export {
  ApiError as ApiClientError,
  ApiErrorType,
  formatDuration,
  formatBytes,
  isNetworkError,
  isTimeoutError,
  isServerError,
  createLoadingIndicator,
  createProgressMessage,
} from './utils';