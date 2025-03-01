import type { EnergyChipClassNames, EnergyChipColors } from './types';

const CLASS_NAMES: EnergyChipClassNames = {
  green: 'bg-green-40',
  grey: 'bg-mono-100',
};

export function getEnergyChipClassName(color: EnergyChipColors) {
  return CLASS_NAMES[color];
}
