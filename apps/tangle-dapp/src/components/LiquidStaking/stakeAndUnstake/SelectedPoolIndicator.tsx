import { ChevronDown } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import useLsActivePool from '../../../data/liquidStaking/useLsActivePool';
import LstIcon from '../LstIcon';

export type SelectedPoolIndicatorProps = {
  onClick?: () => void;
};

const SelectedPoolIndicator: FC<SelectedPoolIndicatorProps> = ({ onClick }) => {
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
      {activePool !== null && <LstIcon iconUrl={activePool.iconUrl} />}

      <Typography variant="h5" fw="bold" className="whitespace-nowrap">
        {activePool?.name === undefined ? (
          'Select LST'
        ) : (
          <>
            {activePool.name.toUpperCase()}{' '}
            <span className="text-mono-180 dark:text-mono-120">
              #{activePool.id}
            </span>
          </>
        )}
      </Typography>

      {onClick !== undefined && (
        <ChevronDown size="lg" className="fill-current dark:fill-current" />
      )}
    </div>
  );
};

export default SelectedPoolIndicator;
