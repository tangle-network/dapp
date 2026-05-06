'use client';

import { Component, ErrorInfo } from 'react';

import { ErrorFallback } from '../../components/ErrorFallback';
import { UIErrorBoundaryProps, UIErrorBoundaryState } from './types';

export class UIErrorBoundary extends Component<
  UIErrorBoundaryProps,
  UIErrorBoundaryState
> {
  state: UIErrorBoundaryState = {
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

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.Fallback ? (
        <this.props.Fallback {...this.state} />
      ) : (
        <div className="flex items-center justify-center w-screen h-screen">
          <ErrorFallback />
        </div>
      );
    }

    return this.props.children;
  }
}
