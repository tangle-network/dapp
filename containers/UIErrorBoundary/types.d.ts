import { default as LoggerService } from '../../../../browser-utils/src/logger/LoggerService';
import { ErrorInfo, ReactNode } from '../../../../../node_modules/react';
export interface UIErrorBoundaryState {
    hasError: boolean;
    error?: Error | null;
    errorInfo?: ErrorInfo | null;
}
export interface UIErrorBoundaryProps {
    children: ReactNode;
    logger: LoggerService;
}
