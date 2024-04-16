import { BN } from '@polkadot/util';
import { Typography } from '@webb-tools/webb-ui-components';
import {
  TypographyFontWeightValues,
  WebbTypographyVariant,
} from '@webb-tools/webb-ui-components/typography/types';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import useNetworkStore from '../../context/useNetworkStore';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';

export type TokenAmountCellProps = {
  amount: BN;
  className?: string;
  typographyVariant?: WebbTypographyVariant;
  typographyFontWeight?: TypographyFontWeightValues;
};

const TokenAmountCell: FC<TokenAmountCellProps> = ({
  amount,
  className,
  typographyVariant = 'body1',
  typographyFontWeight = 'normal',
}) => {
  const { nativeTokenSymbol } = useNetworkStore();
  const formattedBalance = formatBnToDisplayAmount(amount);

  const parts = formattedBalance.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.at(1);

  return (
    <Typography
      variant={typographyVariant}
      fw={typographyFontWeight}
      className={twMerge(
        'text-mono-140 dark:text-mono-40 whitespace-nowrap text-center',
        className
      )}
    >
      {integerPart}

      <span className="opacity-60 text-inherit">
        {decimalPart !== undefined && `.${decimalPart}`} {nativeTokenSymbol}
      </span>
    </Typography>
  );
};

export default TokenAmountCell;
