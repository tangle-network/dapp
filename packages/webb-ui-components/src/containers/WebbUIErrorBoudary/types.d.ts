import { LoggerService } from '@webb-tools/app-util';
import { ErrorInfo } from 'react';

export interface WebbUIErrorBoudaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
}

export interface WebbUIErrorBoudaryProps {
  logger: LoggerService;
}
