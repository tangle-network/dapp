import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { LST_PREFIX } from '../../../constants/liquidStaking';
import { LiquidStakingToken } from '../../../types/liquidStaking';
import LSTTokenIcon from '../../LSTTokenIcon';
import DropdownChevronIcon from './DropdownChevronIcon';

type TokenChipProps = {
  token?: LiquidStakingToken;
  isLiquidVariant: boolean;
  onClick?: () => void;
};

const TokenChip: FC<TokenChipProps> = ({ token, isLiquidVariant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        'group flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-170 px-4 py-2 rounded-lg',
        onClick !== undefined && 'cursor-pointer',
      )}
    >
      {token && <LSTTokenIcon name={token} />}

      <Typography variant="h5" fw="bold">
        {isLiquidVariant && LST_PREFIX}
        {token}
      </Typography>

      {onClick !== undefined && <DropdownChevronIcon />}
    </div>
  );
};

export default TokenChip;
