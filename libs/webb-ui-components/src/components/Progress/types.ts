import { WebbComponentBase } from '../../types';

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
