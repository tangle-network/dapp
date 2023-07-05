import { FC } from 'react';
import cx from 'classnames';
import { Chip, ChipProps } from '@webb-tools/webb-ui-components';

export type PoolType = 'single' | 'multi';

export interface PoolTypeCellProps {
  type: PoolType;
  className?: string;
}

const typeColorMap: Record<PoolTypeCellProps['type'], ChipProps['color']> = {
  single: 'purple',
  multi: 'blue',
};

export const PoolTypeCell: FC<PoolTypeCellProps> = ({ type, className }) => {
  return (
    <div className={cx('text-center', className)}>
      <Chip color={typeColorMap[type]}>{type}</Chip>
    </div>
  );
};
