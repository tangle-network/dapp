import { BN } from '@polkadot/util';
import { ToBn } from '@polkadot/util/types';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';
import { TangleTokenSymbol } from '@webb-tools/tangle-shared-ui/types';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@webb-tools/webb-ui-components';

const formatTangleBalance = (
  balance: BN | bigint | ToBn,
  tokenSymbol?: TangleTokenSymbol,
): string => {
  const formattedAmount = formatDisplayAmount(
    new BN(balance.toString()),
    TANGLE_TOKEN_DECIMALS,
    AmountFormatStyle.SHORT,
  );

  return tokenSymbol === undefined
    ? formattedAmount
    : `${formattedAmount} ${tokenSymbol}`;
};

export default formatTangleBalance;
