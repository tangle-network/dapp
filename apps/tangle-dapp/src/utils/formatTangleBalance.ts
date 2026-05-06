import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config/constants/tangle';
import { TangleTokenSymbol } from '@tangle-network/tangle-shared-ui/types';
import { AmountFormatStyle } from '@tangle-network/ui-components';
import { formatTokenAmount } from './formatTokenAmount';

const formatTangleBalance = (
  balance: bigint,
  tokenSymbol?: TangleTokenSymbol,
): string => {
  const formattedAmount = formatTokenAmount(
    balance,
    TANGLE_TOKEN_DECIMALS,
    AmountFormatStyle.SHORT,
  );

  return tokenSymbol === undefined
    ? formattedAmount
    : `${formattedAmount} ${tokenSymbol}`;
};

export default formatTangleBalance;
