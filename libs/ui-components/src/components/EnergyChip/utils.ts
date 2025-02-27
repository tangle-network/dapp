import type { EnergyChipClassNames, EnergyChipColors } from './types';

const CLASS_NAMES: EnergyChipClassNames = {
  green: 'bg-green-40',
  grey: 'bg-mono-100',
};

/**
 * Get the Tailwind class name for `EnergyChip` component based on `color`
 * @param color The energy chip color
 * @returns Tailwind class name for style the `EnergyChip` component
 */
export function getEnergyChipClassName(color: EnergyChipColors) {
  return CLASS_NAMES[color];
}
