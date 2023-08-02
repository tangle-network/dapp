import { ComponentProps } from 'react';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info';

export interface StatusIndicatorProps extends ComponentProps<'svg'> {
  /**
   * The color variant of the status indicator.
   * @default 'info'
   */
  variant?: StatusVariant;

  /**
   * The size of the status indicator.
   * @default 12
   */
  size?: number;
}
