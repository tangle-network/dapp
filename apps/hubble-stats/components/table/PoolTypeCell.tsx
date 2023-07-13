import { FC } from 'react';
import cx from 'classnames';
import { Chip, ChipProps } from '@webb-tools/webb-ui-components';

import { PoolTypeCellProps } from './types';

const typeColorMap: Record<PoolTypeCellProps['type'], ChipProps['color']> = {
  single: 'purple',
  multi: 'blue',
};

const PoolTypeCell: FC<PoolTypeCellProps> = ({ type, className }) => {
  return (
    <div className={cx('text-center', className)}>
      <Chip color={typeColorMap[type]}>{type}</Chip>
    </div>
  );
};

export default PoolTypeCell;
