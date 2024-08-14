import { Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  LS_PROTOCOLS,
  LST_PREFIX,
  LsToken,
} from '../../../constants/liquidStaking/types';
import ChainLogo from './ChainLogo';
import DropdownChevronIcon from './DropdownChevronIcon';

type TokenChipProps = {
  token?: LsToken;
  isLiquidVariant: boolean;
  onClick?: () => void;
};

const TokenChip: FC<TokenChipProps> = ({ token, isLiquidVariant, onClick }) => {
  const chain = (() => {
    if (token === undefined) {
      return null;
    }

    const result = LS_PROTOCOLS.find((protocol) => protocol.token === token);

    assert(
      result !== undefined,
      'All tokens should have a corresponding protocol',
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
        {isLiquidVariant && LST_PREFIX}
        {token}
      </Typography>

      {onClick !== undefined && <DropdownChevronIcon />}
    </div>
  );
};

export default TokenChip;
