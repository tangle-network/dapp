import {
  HiddenValue,
  HiddenValueEye,
  SkeletonLoader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { InfoIconWithTooltip } from '../../components';
import { TANGLE_TOKEN_UNIT } from '../../constants';
import useAccountBalances from '../../hooks/useAccountBalances';
import useFormattedBalance from '../../hooks/useFormattedBalance';

const TotalBalance: FC = () => {
  const { total } = useAccountBalances();
  const formattedTotal = useFormattedBalance(total, false);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <div className="flex items-center gap-2">
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-40"
          >
            Total Balance
          </Typography>

          <HiddenValueEye />

          <InfoIconWithTooltip
            content={
              <span className="block text-center">
                The total balance is defined as:{' '}
                <strong>Transferrable + locked</strong> balances. This includes
                tokens locked in staking, vesting, and more.
              </span>
            }
          />
        </div>

        <div className="flex items-center gap-4">
          {formattedTotal !== null ? (
            <div className="flex gap-2 items-end py-2">
              <Typography variant="h2" fw="bold" className="!leading-none">
                <HiddenValue>{formattedTotal}</HiddenValue>
              </Typography>

              <Typography
                variant="h4"
                fw="normal"
                className="!leading-none pb-1"
              >
                {TANGLE_TOKEN_UNIT}
              </Typography>
            </div>
          ) : (
            <SkeletonLoader size="xl" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalBalance;
