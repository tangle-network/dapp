import { BN } from '@tangle-network/tangle-shared-ui/bn';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config/constants/tangle';
import { TangleTokenSymbol } from '@tangle-network/tangle-shared-ui/types';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components';

const formatTangleBalance = (
  balance: BN | bigint,
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
