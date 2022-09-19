import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

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
}

export type ChipClassNames = {
  [key in ChipColors]: {
    active: string;
    disabled: string;
  };
};
