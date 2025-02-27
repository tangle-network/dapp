import { ComponentBase } from '../../types';

export enum EnergyChipColors {
  GREEN = 'green',
  GREY = 'grey',
}

/**
 * The `Chip` props
 */
export interface EnergyChipProps extends ComponentBase {
  /**
   * The visual style of the badge
   *
   * @type {("green"|"grey" | "dark-grey")}
   *
   * @default "green"
   */
  color?: EnergyChipColors;
}

export type EnergyChipClassNames = {
  [key in EnergyChipColors]: string;
};

/**
 * The `EnergyChipStack` props
 */
export interface EnergyChipStackProps extends ComponentBase {
  /**
   * The number of energy chips to display
   * @default 10
   */
  stack?: number;
  /**
   * The color of the energy chips
   * @default ["green"]
   */
  colors?: EnergyChipColors[];

  /**
   * The label of the energy chip stack
   * @default "{EMPTY_VALUE_PLACEHOLDER}"
   */
  label?: string;

  /**
   * The className of the energy chip stack wrapper
   */
  className?: string;
}
