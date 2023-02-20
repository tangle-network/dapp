import React, { ErrorInfo } from 'react';

import { ErrorFallback } from '../../components';
import { WebbUIErrorBoudaryProps, WebbUIErrorBoudaryState } from './types';

export class WebbUIErrorBoudary extends React.Component<
  WebbUIErrorBoudaryProps,
  WebbUIErrorBoudaryState
> {
  state: WebbUIErrorBoudaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: unknown) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error as any };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    this.props.logger.error(errorInfo);
    this.props.logger.debug({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-screen h-screen">
          <ErrorFallback />
        </div>
      );
    }

    return this.props.children;
  }
}
