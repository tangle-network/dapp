import {
  HiddenValue,
  HiddenValueEye,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useBalances from '../../data/balances/useBalances';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';
import { formatTokenBalance } from '../../utils/polkadot';
import { InfoIconWithTooltip } from '..';

const Balance: FC = () => {
  const { transferrable: balance } = useBalances();
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedBalance =
    balance === null ? null : formatTokenBalance(balance, nativeTokenSymbol);

  const parts = formattedBalance?.split(' ');
  const prefix = parts?.[0] ?? '--';
  const suffix = parts?.[1] ?? nativeTokenSymbol;

  const formattedExtendedBalance = useMemo(() => {
    if (balance === null) {
      return null;
    }

    const amount = formatBnToDisplayAmount(balance, {
      // Show up to 4 decimal places.
      fractionLength: 4,
      includeCommas: true,
      padZerosInFraction: true,
    });

    return `${amount} ${nativeTokenSymbol}`;
  }, [balance, nativeTokenSymbol]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <div className="flex items-center gap-2">
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-40"
          >
            Free Balance
          </Typography>

          <HiddenValueEye />
        </div>

        <div className="flex items-center">
          <div className="flex gap-2 items-end py-2">
            <Typography variant="h2" fw="bold" className="!leading-none">
              <HiddenValue numberOfStars={4}>{prefix}</HiddenValue>
            </Typography>

            <Typography
              variant="h4"
              fw="normal"
              className="!leading-none pb-1 flex gap-2"
            >
              {suffix}

              {balance !== null && !balance.isZero() && (
                <InfoIconWithTooltip content={formattedExtendedBalance} />
              )}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balance;
