import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

/**
 * The `TimeProgress` props
 */
export interface TimeProgressProps extends WebbComponentBase {
  /**
   * The start time
   */
  startTime: Date | string;
  /**
   * The end time
   */
  endTime: Date | string;
}
