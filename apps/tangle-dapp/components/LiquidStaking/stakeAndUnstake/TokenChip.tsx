import { Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LIQUID_STAKING_CHAINS,
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingToken,
} from '../../../constants/liquidStaking';
import ChainLogo from './ChainLogo';
import DropdownChevronIcon from './DropdownChevronIcon';

type TokenChipProps = {
  token?: LiquidStakingToken;
  isLiquidVariant: boolean;
  onClick?: () => void;
};

const TokenChip: FC<TokenChipProps> = ({ token, isLiquidVariant, onClick }) => {
  const chain = (() => {
    if (token === undefined) {
      return null;
    }

    const result = LIQUID_STAKING_CHAINS.find((chain) => chain.token === token);

    assert(
      result !== undefined,
      'All tokens should have a corresponding chain',
    );

    return result;
  })();

  return (
    <div
      onClick={onClick}
      className={twMerge(
        'group flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-170 px-4 py-2 rounded-lg',
        onClick !== undefined && 'cursor-pointer',
      )}
    >
      <ChainLogo
        size="sm"
        chainId={chain?.id}
        isRounded
        isLiquidVariant={isLiquidVariant}
      />

      <Typography variant="h5" fw="bold">
        {isLiquidVariant && LIQUID_STAKING_TOKEN_PREFIX}
        {token}
      </Typography>

      {onClick !== undefined && <DropdownChevronIcon />}
    </div>
  );
};

export default TokenChip;
