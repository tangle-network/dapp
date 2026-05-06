import type LoggerService from '@tangle-network/browser-utils/logger/LoggerService';
import type { ErrorInfo, FunctionComponent, ReactNode } from 'react';

export interface UIErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
}

export interface UIErrorBoundaryProps {
  children: ReactNode;
  Fallback?: FunctionComponent<UIErrorBoundaryState>;
  logger: LoggerService;
}
