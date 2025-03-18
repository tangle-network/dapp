import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { Typography } from '@tangle-network/ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import DropdownChevronIcon from '../../DropdownChevronIcon';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { LsToken } from '../../../constants/liquidStaking/types';

type LsTokenChipProps = {
  isDerivativeVariant: boolean;
  onClick?: () => void;
};

const LsTokenChip: FC<LsTokenChipProps> = ({
  isDerivativeVariant,
  onClick,
}) => {
  const networkTokenSymbol = useNetworkStore(
    (store) => store.network2?.tokenSymbol,
  );

  const token =
    networkTokenSymbol === undefined
      ? LsToken.T_TNT
      : networkTokenSymbol === 'TNT'
        ? LsToken.TNT
        : LsToken.T_TNT;

  return (
    <div
      onClick={onClick}
      className={twMerge(
        'group flex gap-2 justify-center items-center px-4 py-2 rounded-full',
        'border border-mono-100 dark:border-mono-140',
        'bg-mono-40 dark:bg-mono-170',
        onClick !== undefined &&
          'cursor-pointer hover:bg-mono-20 hover:dark:bg-mono-160',
      )}
    >
      {token && (
        <LsTokenIcon hasRainbowBorder={isDerivativeVariant} name={token} />
      )}

      <Typography variant="h5" fw="bold">
        {token}
      </Typography>

      {onClick !== undefined && <DropdownChevronIcon />}
    </div>
  );
};

export default LsTokenChip;
