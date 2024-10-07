import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import { LsToken } from '../../../constants/liquidStaking/types';
import LsTokenIcon from '../../LsTokenIcon';
import DropdownChevronIcon from './DropdownChevronIcon';

type TokenChipProps = {
  token?: LsToken;
  isDerivativeVariant: boolean;
  onClick?: () => void;
};

const TokenChip: FC<TokenChipProps> = ({
  token,
  isDerivativeVariant,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        'group flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-170 px-4 py-2 rounded-lg',
        onClick !== undefined && 'cursor-pointer',
      )}
    >
      {token && (
        <LsTokenIcon hasRainbowBorder={isDerivativeVariant} name={token} />
      )}

      <Typography variant="h5" fw="bold">
        {isDerivativeVariant && LS_DERIVATIVE_TOKEN_PREFIX}
        {token}
      </Typography>

      {onClick !== undefined && <DropdownChevronIcon />}
    </div>
  );
};

export default TokenChip;
