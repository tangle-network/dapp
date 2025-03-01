import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import { EnergyChip } from './EnergyChip';
import { EnergyChipColors, EnergyChipStackProps } from './types';
import { Typography } from '../../typography';
import { twMerge } from 'tailwind-merge';

export const EnergyChipStack = (props: EnergyChipStackProps) => {
  const {
    stack = 10,
    colors = Array(stack).fill(EnergyChipColors.GREY),
    label = EMPTY_VALUE_PLACEHOLDER,
    className,
    ...restProps
  } = props;

  return (
    <div
      className={twMerge('flex items-center gap-1', className)}
      {...restProps}
    >
      {Array.from({ length: stack }).map((_, index) => (
        <EnergyChip key={index} color={colors[index]} />
      ))}
      <Typography variant="body2" className="text-mono-120 dark:text-mono-80">
        {label}
      </Typography>
    </div>
  );
};

EnergyChipStack.displayName = 'EnergyChipStack';
