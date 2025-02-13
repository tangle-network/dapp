import type LoggerService from '@tangle-network/browser-utils/logger/LoggerService';
import type { ErrorInfo, ReactNode } from 'react';

export interface WebbUIErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
}

export interface WebbUIErrorBoundaryProps {
  children: ReactNode;
  logger: LoggerService;
}
