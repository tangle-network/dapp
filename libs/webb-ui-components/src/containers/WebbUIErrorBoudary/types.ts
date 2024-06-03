import type LoggerService from '@webb-tools/browser-utils/logger/LoggerService';
import type { ErrorInfo, ReactNode } from 'react';

export interface WebbUIErrorBoudaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
}

export interface WebbUIErrorBoudaryProps {
  children: ReactNode;
  logger: LoggerService;
}
