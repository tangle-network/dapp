import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  HiddenValue,
  HiddenValueEye,
  Typography,
} from '@webb-tools/webb-ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { FC } from 'react';

import useBalances from '../../data/balances/useBalances';
import formatTangleBalance from '../../utils/formatTangleBalance';

const Balance: FC = () => {
  const { transferable: balance } = useBalances();
  const { nativeTokenSymbol } = useNetworkStore();

  const formattedBalance =
    balance === null ? null : formatTangleBalance(balance, nativeTokenSymbol);

  const parts = formattedBalance?.split(' ');
  const prefix = parts?.[0] ?? EMPTY_VALUE_PLACEHOLDER;
  const suffix = parts?.[1] ?? nativeTokenSymbol;

  return (
    <div className="flex flex-col w-full gap-5">
      <div>
        <div className="flex items-center gap-2">
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-80"
          >
            Transferable Balance
          </Typography>

          <HiddenValueEye className="hover:bg-mono-40" />
        </div>

        <div className="flex items-center">
          <div className="flex items-end gap-2 py-2">
            <Typography variant="h2" fw="bold" className="!leading-none">
              <HiddenValue numberOfStars={4}>{prefix}</HiddenValue>
            </Typography>

            <Typography variant="h4" className="!leading-none pb-1 flex gap-2">
              {suffix}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balance;
