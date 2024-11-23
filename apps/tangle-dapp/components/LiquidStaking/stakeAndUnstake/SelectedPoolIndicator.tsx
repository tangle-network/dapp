import { ChevronDown } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import useLsActivePoolDisplayName from '../../../data/liquidStaking/useLsActivePoolDisplayName';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import LsTokenIcon from '../../LsTokenIcon';

export type SelectedPoolIndicatorProps = {
  onClick?: () => void;
};

const SelectedPoolIndicator: FC<SelectedPoolIndicatorProps> = ({ onClick }) => {
  const { lsProtocolId } = useLsStore();
  const selectedProtocol = getLsProtocolDef(lsProtocolId);
  const { name, id } = useLsActivePoolDisplayName();

  return (
    <div
      onClick={onClick}
      className={twMerge(
        'group flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-170 px-4 py-2 rounded-lg',
        onClick !== undefined &&
          'cursor-pointer hover:bg-mono-60 hover:hover:dark:bg-mono-160',
      )}
    >
      {name !== null && (
        <LsTokenIcon hasRainbowBorder name={selectedProtocol.token} />
      )}

      <Typography variant="h5" fw="bold" className="whitespace-nowrap">
        {name === null ? (
          'Select LST'
        ) : (
          <>
            {name.toUpperCase()}
            <span className="text-mono-180 dark:text-mono-120">#{id}</span>
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
