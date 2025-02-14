import type LoggerService from '@tangle-network/browser-utils/logger/LoggerService';
import type { ErrorInfo, ReactNode } from 'react';

export interface UIErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
}

export interface UIErrorBoundaryProps {
  children: ReactNode;
  logger: LoggerService;
}
