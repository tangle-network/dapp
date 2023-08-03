import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { ShieldedAssetIcon } from '@webb-tools/icons';

import { DestinationCellProps } from './types';

const DestinationCell: FC<DestinationCellProps> = ({ className }) => {
  return (
    <span
      className={twMerge(
        'w-fit bg-[#ECF4FF] px-2 py-1.5 rounded-md',
        'inline-flex items-center gap-1',
        'uppercase text-[12px] leading-[15px] font-bold !text-mono-120',
        className
      )}
    >
      <ShieldedAssetIcon />
      shielded
    </span>
  );
};

export default DestinationCell;
