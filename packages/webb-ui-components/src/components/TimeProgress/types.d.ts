import { ISubQlTime } from '@webb-dapp/page-statistics/provider/stats-provider';
import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

/**
 * The `TimeProgress` props
 */
export interface TimeProgressProps extends WebbComponentBase {
  /**
   * The start time
   */
  startTime: Date | string | null;
  /**
   * The end time
   */
  endTime: Date | string | null;

  /**
   * Coustome time object
   * */
  now?: ISubQlTime;
}
