import { Component, ErrorInfo } from '../../../../../node_modules/react';
import { UIErrorBoundaryProps, UIErrorBoundaryState } from './types';
export declare class UIErrorBoundary extends Component<UIErrorBoundaryProps, UIErrorBoundaryState> {
    state: UIErrorBoundaryState;
    static getDerivedStateFromError(error: unknown): {
        hasError: boolean;
        error: any;
    };
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): string | number | boolean | import("react/jsx-runtime").JSX.Element | Iterable<import('../../../../../node_modules/react').ReactNode> | null | undefined;
}
