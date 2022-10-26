import { LoggerService } from '@webb-tools/app-util';
import React from 'react';

interface DAppErrorState {
  hasError: boolean;
}

interface DAppErrorProps {
  children: React.ReactNode;
  logger: LoggerService;
}

export class DAppError extends React.Component<DAppErrorProps, DAppErrorState> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(error: unknown) {
    console.log(error);

    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // You can also log the error to an error reporting service
    this.props.logger.error(errorInfo);
    this.props.logger.debug({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return <div>Some thing went unexpected</div>;
    }

    return this.props.children;
  }
}
