import { FC } from 'react';
import { Chip, ChipProps } from '@webb-tools/webb-ui-components';

import { PoolType, PoolTypeChipProps } from './types';

const typeColorMap: Record<PoolType, ChipProps['color']> = {
  single: 'purple',
  multi: 'blue',
};

const PoolTypeChip: FC<PoolTypeChipProps> = ({ type = 'single', name }) => {
  return <Chip color={typeColorMap[type]}>{name ?? type}</Chip>;
};

export default PoolTypeChip;
