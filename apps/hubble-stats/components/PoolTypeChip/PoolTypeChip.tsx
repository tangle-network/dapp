import { FC } from 'react';
import { Chip, ChipProps } from '@webb-tools/webb-ui-components';

import { PoolTypeChipProps } from './types';

const typeColorMap: Record<PoolTypeChipProps['type'], ChipProps['color']> = {
  single: 'purple',
  multi: 'blue',
};

const PoolTypeChip: FC<PoolTypeChipProps> = ({ type, name }) => {
  return <Chip color={typeColorMap[type]}>{name ?? type}</Chip>;
};

export default PoolTypeChip;
