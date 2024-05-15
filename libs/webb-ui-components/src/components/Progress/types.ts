import { PropsOf, WebbComponentBase } from '../../types';

type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps extends WebbComponentBase {
  /**
   * The progress value.
   */
  value: number | null;
  /**
   * The maximum progress value.
   */
  max?: number;
  /**
   * The `Progress` bar size
   * @default "md"
   */
  size?: ProgressSize;
  /**
   * The string before the value label
   */
  prefixLabel?: string;
  /**
   * The string after the value label
   */
  suffixLabel?: string;
}

export type ProgressClassName = {
  [key in ProgressSize]: {
    root: string;
    indicator: string;
    label: string;
  };
};

export interface SteppedProgressProps extends PropsOf<'ul'> {
  /**
   * The total number of steps
   * @default 5
   */
  steps?: number;

  /**
   * The current active step
   */
  activeStep?: number;

  /**
   * If `true`, the steps will be displayed paused
   */
  paused?: boolean;
}
