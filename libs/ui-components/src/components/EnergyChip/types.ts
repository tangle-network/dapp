import { ComponentBase } from '../../types';

export enum EnergyChipColors {
  GREEN = 'green',
  GREY = 'grey',
}

export interface EnergyChipProps extends ComponentBase {
  /**
   * @type {("green" | "grey")}
   *
   * @default "green"
   */
  color?: EnergyChipColors;
}

export type EnergyChipClassNames = {
  [key in EnergyChipColors]: string;
};

export interface EnergyChipStackProps extends ComponentBase {
  /**
   * The number of energy chips to display
   * @default 10
   */
  stack?: number;
  /**
   * @default ["green"]
   */
  colors?: EnergyChipColors[];

  /**
   * @default "{EMPTY_VALUE_PLACEHOLDER}"
   */
  label?: string;

  className?: string;
}
