import React, { ErrorInfo } from 'react';

import { WebbUIErrorBoudaryProps, WebbUIErrorBoudaryState } from './types';

export class WebbUIErrorBoudary extends React.Component<WebbUIErrorBoudaryProps, WebbUIErrorBoudaryState> {
  state: WebbUIErrorBoudaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: unknown) {
    console.log(error);

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
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
