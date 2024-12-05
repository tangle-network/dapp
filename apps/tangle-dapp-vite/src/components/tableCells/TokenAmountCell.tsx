import { BN } from '@polkadot/util';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import formatDisplayAmount, {
  AmountFormatStyle,
} from '../../utils/formatDisplayAmount';
import formatTangleBalance from '../../utils/formatTangleBalance';

export type TokenAmountCellProps = {
  amount: BN;
  className?: string;
  symbol?: string;
  decimals?: number;
  formatStyle?: AmountFormatStyle;
};

const TokenAmountCell: FC<TokenAmountCellProps> = ({
  amount,
  className,
  symbol,
  decimals,
  formatStyle: format = AmountFormatStyle.EXACT,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedBalance = useMemo(() => {
    // Default to Tangle decimals if not provided.
    if (decimals === undefined) {
      return formatTangleBalance(amount);
    }

    return formatDisplayAmount(amount, decimals, format);
  }, [amount, decimals, format]);

  const parts = formattedBalance.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.at(1);

  return (
    <span
      className={twMerge(
        'text-mono-140 dark:text-mono-40 whitespace-nowrap block',
        className,
      )}
    >
      {integerPart}

      <span className="!text-opacity-60 text-inherit">
        {decimalPart !== undefined && `.${decimalPart}`}{' '}
        {typeof symbol === 'string' ? symbol : nativeTokenSymbol}
      </span>
    </span>
  );
};

export default TokenAmountCell;
