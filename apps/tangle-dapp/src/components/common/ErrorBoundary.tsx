import { Component, ErrorInfo, ReactNode } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900">
            <Typography variant="body1" color="error">
              Something went wrong. Please try again later.
            </Typography>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
