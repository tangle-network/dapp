import { BN } from '@polkadot/util';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import formatBn from '../../utils/formatBn';
import formatTangleBalance from '../../utils/formatTangleBalance';

export type TokenAmountCellProps = {
  amount: BN;
  className?: string;
  symbol?: string;
  decimals?: number;
};

const TokenAmountCell: FC<TokenAmountCellProps> = ({
  amount,
  className,
  symbol,
  decimals,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedBalance = useMemo(() => {
    // Default to Tangle decimals if not provided.
    if (decimals === undefined) {
      return formatTangleBalance(amount);
    }

    return formatBn(amount, decimals, {
      includeCommas: true,
    });
  }, [amount, decimals]);

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
