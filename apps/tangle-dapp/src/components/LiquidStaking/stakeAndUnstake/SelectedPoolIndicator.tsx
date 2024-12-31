import { ChevronDown } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import useLsActivePool from '../../../data/liquidStaking/useLsActivePool';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import LstIcon from '../LstIcon';

export type SelectedPoolIndicatorProps = {
  onClick?: () => void;
};

const SelectedPoolIndicator: FC<SelectedPoolIndicatorProps> = ({ onClick }) => {
  const { lsProtocolId } = useLsStore();
  const activePool = useLsActivePool();

  return (
    <div
      onClick={onClick}
      className={twMerge(
        'group flex gap-2 justify-center items-center px-4 py-2 rounded-full',
        'border border-mono-100 dark:border-mono-140',
        'bg-mono-40 dark:bg-mono-170',
        onClick !== undefined &&
          'cursor-pointer hover:bg-mono-60 hover:dark:bg-mono-160',
      )}
    >
      {activePool !== null && (
        <LstIcon lsProtocolId={lsProtocolId} iconUrl={activePool.iconUrl} />
      )}

      <Typography variant="h5" fw="bold" className="whitespace-nowrap">
        {activePool?.name === undefined ? (
          'Select LST'
        ) : (
          <>
            {activePool.name.toUpperCase()}
            <span className="text-mono-180 dark:text-mono-120">
              #{activePool.id}
            </span>
          </>
        )}
      </Typography>

      {onClick !== undefined && (
        <ChevronDown className="fill-current dark:fill-current" />
      )}
    </div>
  );
};

export default SelectedPoolIndicator;
