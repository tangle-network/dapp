import React from 'react';
import { WebbComponentBase } from '../../types/index.js';

export type ChipColors =
  | 'green'
  | 'blue'
  | 'purple'
  | 'yellow'
  | 'red'
  | 'grey'
  | 'dark-grey';

/**
 * The `Chip` props
 */
export interface ChipProps extends WebbComponentBase {
  /**
   * The visual style of the badge
   *
   * @type {("green"|"blue"|"purple"|"yellow"|"red" | "grey" | "dark-grey")}
   *
   * @default "green"
   */
  color?: ChipColors;
  /**
   * If `true`, the chip will display as disabled state
   */
  isDisabled?: boolean;
  isSelected?: boolean;
  children?: React.ReactNode;
}

export type ChipClassNames = {
  [key in ChipColors]: {
    active: string;
    disabled: string;
    selected: string;
  };
};
