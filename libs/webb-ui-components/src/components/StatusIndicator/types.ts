import { PropsOf } from '../../types';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info';

export interface StatusIndicatorProps extends PropsOf<'span'> {
  /**
   * The color variant of the status indicator.
   * @default 'info'
   */
  variant?: StatusVariant;
}
