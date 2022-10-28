import { LoggerService } from '@webb-tools/app-util';
import React, { ErrorInfo } from 'react';

export interface WebbUIErrorBoudaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
}

export interface WebbUIErrorBoudaryProps {
  children: React.ReactNode;
  logger: LoggerService;
}
