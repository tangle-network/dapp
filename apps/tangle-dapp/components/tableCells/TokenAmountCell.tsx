import { BN } from '@polkadot/util';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import useNetworkStore from '../../context/useNetworkStore';
import formatBn from '../../utils/formatBn';
import formatTangleBalance from '../../utils/formatTangleBalance';

export type TokenAmountCellProps = {
  amount: BN;
  className?: string;
  tokenSymbol?: string;
  decimals?: number;
};

const TokenAmountCell: FC<TokenAmountCellProps> = ({
  amount,
  className,
  tokenSymbol,
  decimals,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedBalance = useMemo(() => {
    // Default to Tangle decimals if not provided.
    if (decimals === undefined) {
      return formatTangleBalance(amount);
    }

    return formatBn(amount, decimals);
  }, [amount, decimals]);

  const parts = formattedBalance.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.at(1);

  return (
    <span
      className={twMerge(
        'text-mono-140 dark:text-mono-40 whitespace-nowrap block text-center',
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
