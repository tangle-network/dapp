import { BN, formatBalance } from '@polkadot/util';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import useNetworkStore from '../../context/useNetworkStore';
import formatTangleBalance from '../../utils/formatTangleBalance';

export type TokenAmountCellProps = {
  amount: BN;
  className?: string;
  tokenSymbol?: string;
  decimals?: number;
  alignCenter?: boolean;
};

const TokenAmountCell: FC<TokenAmountCellProps> = ({
  amount,
  className,
  tokenSymbol,
  decimals,
  alignCenter = true,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedBalance = useMemo(() => {
    if (decimals === undefined) {
      return formatTangleBalance(amount);
    }

    return formatBalance(amount, {
      decimals,
      withZero: false,
      // This ensures that the balance is always displayed in the
      // base unit, preventing the conversion to larger or smaller
      // units (e.g. kilo, milli, etc.).
      forceUnit: '-',
      withUnit: false,
    });
  }, [amount, decimals]);

  const parts = formattedBalance.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.at(1);

  return (
    <span
      className={twMerge(
        'text-mono-140 dark:text-mono-40 whitespace-nowrap',
        alignCenter && 'block text-center',
        className,
      )}
    >
      {integerPart}

      <span className="!text-opacity-60 text-inherit">
        {decimalPart !== undefined && `.${decimalPart}`}{' '}
        {tokenSymbol ?? nativeTokenSymbol}
      </span>
    </span>
  );
};

export default TokenAmountCell;
