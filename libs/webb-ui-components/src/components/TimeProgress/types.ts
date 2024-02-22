import { ISubQlTime, WebbComponentBase } from '../../types';

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
   * Custom time object
   * */
  now?: ISubQlTime;

  /**
   * The className to override the style of the labels (optional)
   */
  labelClassName?: string;
}
