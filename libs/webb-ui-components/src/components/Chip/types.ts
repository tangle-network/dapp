import { WebbComponentBase } from '../../types';
import React from 'react';

export type ChipColors = 'green' | 'blue' | 'purple' | 'yellow' | 'red';

/**
 * The `Chip` props
 */
export interface ChipProps extends WebbComponentBase {
  /**
   * The visual style of the badge
   *
   * @type {("green"|"blue"|"blue"|"purple"|"yellow"|"red")}
   *
   * @default "green"
   */
  color?: ChipColors;
  /**
   * If `true`, the chip will display as disabled state
   */
  isDisabled?: boolean;
  children?: React.ReactNode;
}

export type ChipClassNames = {
  [key in ChipColors]: {
    active: string;
    disabled: string;
  };
};
