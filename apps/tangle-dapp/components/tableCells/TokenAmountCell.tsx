import { BN } from '@polkadot/util';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';

const TokenAmountCell: FC<{ amount: BN }> = ({ amount }) => {
  const { nativeTokenSymbol } = useNetworkStore();
  const formattedBalance = formatBnToDisplayAmount(amount);

  const parts = formattedBalance.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.at(1);

  return (
    <Typography
      variant="body1"
      fw="normal"
      className="text-mono-140 dark:text-mono-40 whitespace-nowrap text-center"
    >
      {integerPart}

      <span className="opacity-60">
        {decimalPart !== undefined && `.${decimalPart}`} {nativeTokenSymbol}
      </span>
    </Typography>
  );
};

export default TokenAmountCell;
