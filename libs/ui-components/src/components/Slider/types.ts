import { WebbComponentBase } from '../../types';

type SliderOmissions = 'dir' | 'defaultValue' | 'onChange';
export interface SliderProps extends Omit<WebbComponentBase, SliderOmissions> {
  /**
   * The value of the slider when initially rendered. Use when you do not need to control the state of the slider.
   */
  defaultValue?: number[];
  /**
   * The controlled value of the slider. Must be used in conjunction with `onChange`.
   */
  value?: number[];
  /**
   * Event handler called when the value changes.
   */
  onChange?: (nextValue: number[]) => void;
  /**
   * The minimum permitted steps between multiple.
   * @default 0
   */
  minStepsBetweenThumbs?: number;
  /**
   * The name of the slider. Submitted with its owning form as part of a name/value pair.
   */
  name?: string;
  /**
   * When true, prevents the user from interacting with the slider.
   */
  isDisabled?: boolean;
  /**
   * The minimum value for the range.
   * @default 0
   */
  min?: number;
  /**
   * The maximum value for the range
   * @default 100
   */
  max?: number;
  /**
   * The stepping interval.
   * @default 1
   */
  step?: number;
  /**
   * If `true`, the value label will be displayed on top of the thumb
   */
  hasLabel?: boolean;
}

export interface SliderThumbProps extends Pick<SliderProps, 'hasLabel'> {
  value: number;
}
