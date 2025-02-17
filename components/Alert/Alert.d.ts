import { AlertProps } from './types';
/**
 * Alert component
 *
 * Props:
 *
 * - `size`: Alert size - `md` (default), `lg`
 * - `type`: Alert type - `info` (default), `success`, `error`
 * - `title`: Alert title
 * - `description`: Alert description
 * - `className`: Outer class name
 *
 * @example
 *
 * <Alert title="Transaction Status" description="Your transaction was successful!" type='success' />
 */
export declare const Alert: React.FC<AlertProps>;
