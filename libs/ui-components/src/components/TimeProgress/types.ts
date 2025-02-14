import { ISubQlTime, ComponentBase } from '../../types';

/**
 * The `TimeProgress` props
 */
export interface TimeProgressProps extends ComponentBase {
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
