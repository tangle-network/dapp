import { ChevronDown } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LIQUID_STAKING_CHAINS,
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingToken,
} from '../../constants/liquidStaking';
import ChainLogo from './ChainLogo';

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
        'flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-160 px-4 py-2 rounded-lg',
        onClick !== undefined && 'cursor-pointer hover:dark:bg-mono-140',
      )}
    >
      <ChainLogo size="sm" chainId={chain?.id} isRounded />

      <Typography variant="h5" fw="bold">
        {isLiquidVariant && LIQUID_STAKING_TOKEN_PREFIX}
        {token}
      </Typography>

      {onClick !== undefined && <ChevronDown />}
    </div>
  );
};

export default TokenChip;
