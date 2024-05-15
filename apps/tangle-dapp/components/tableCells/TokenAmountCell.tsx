import { BN } from '@polkadot/util';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import useNetworkStore from '../../context/useNetworkStore';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';

export type TokenAmountCellProps = {
  amount: BN;
  className?: string;
};

const TokenAmountCell: FC<TokenAmountCellProps> = ({ amount, className }) => {
  const { nativeTokenSymbol } = useNetworkStore();
  const formattedBalance = formatBnToDisplayAmount(amount);

  const parts = formattedBalance.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.at(1);

  return (
    <span
      className={twMerge(
        'text-mono-140 dark:text-mono-40 whitespace-nowrap block text-center',
        className
      )}
    >
      {integerPart}

      <span className="opacity-60 text-inherit">
        {decimalPart !== undefined && `.${decimalPart}`} {nativeTokenSymbol}
      </span>
    </span>
  );
};

export default TokenAmountCell;
