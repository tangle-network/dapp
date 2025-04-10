import { BN_ZERO } from '@polkadot/util';
import { ArrowDownIcon, StatusIndicator } from '@tangle-network/icons';
import useVaultsPotAccounts from '@tangle-network/tangle-shared-ui/data/rewards/useVaultsPotAccounts';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import {
  AmountFormatStyle,
  Card,
  CardVariant,
  formatDisplayAmount,
  Typography,
} from '@tangle-network/ui-components';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import { FC, useCallback } from 'react';
import { map } from 'rxjs';
import { twMerge } from 'tailwind-merge';
import VaultsHightlightCard from './VaultsHightlightCard';
import { StatsItem } from './StatsItem';

type Props = {
  className?: string;
};

export const ProtocolStatisticCard: FC<Props> = ({ className }) => {
  const tvlInUsd = BN_ZERO;
  const tvlInUsdChangePercentage = 0;
  const isUp = true;

  return (
    <Card
      variant={CardVariant.GLASS}
      className={twMerge(className, 'p-0 flex')}
    >
      <div className="p-6 space-y-5 grow">
        <div className="flex items-center gap-2">
          <StatusIndicator size={16} variant="success" />
          <Typography
            variant="h5"
            fw="bold"
            className={twMerge(
              'bg-gradient-to-r from-purple-50 to-mono-100',
              'dark:from-mono-100 dark:to-purple-40',
              'bg-clip-text text-transparent dark:text-transparent',
            )}
          >
            Now Live: Season 1
          </Typography>
        </div>

        <div>
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-80"
          >
            Total Value Locked
          </Typography>

          <div className="flex items-center gap-3 py-2">
            <Typography variant="h2" fw="bold" className="!leading-none">
              ${formatDisplayAmount(tvlInUsd, 1, AmountFormatStyle.SHORT)}
            </Typography>

            <Typography
              variant="body1"
              fw="semibold"
              className={twMerge(
                '!leading-none flex items-center',
                isUp
                  ? 'text-green-50 dark:text-green-50'
                  : 'text-red-50 dark:text-red-50',
              )}
            >
              {isUp ? (
                <ArrowDownIcon className="size-6 rotate-180 !fill-current" />
              ) : (
                <ArrowDownIcon className="size-6 !fill-current" />
              )}
              {addCommasToNumber(tvlInUsdChangePercentage.toFixed(1))}%
            </Typography>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <RestakerCountStats />

          <OperatorCountStats />

          <VaultCountStats />
        </div>
      </div>

      <VaultsHightlightCard className="grow max-w-60" />
    </Card>
  );
};

const RestakerCountStats: FC = () => {
  const result = useApiRx(
    useCallback(
      (apiRx) =>
        apiRx.query.multiAssetDelegation.delegators
          .keys()
          .pipe(map((keys) => keys.length)),
      [],
    ),
  );

  return <StatsItem label="Restakers" {...result} displayLabelBottom />;
};

const OperatorCountStats: FC = () => {
  const result = useApiRx(
    useCallback(
      (apiRx) =>
        apiRx.query.multiAssetDelegation.operators
          .keys()
          .pipe(map((keys) => keys.length)),
      [],
    ),
  );

  return <StatsItem label="Operators" {...result} displayLabelBottom />;
};

const VaultCountStats: FC = () => {
  const { result, ...restProps } = useVaultsPotAccounts();

  return (
    <StatsItem
      label="Vaults"
      {...restProps}
      result={result?.size ?? null}
      displayLabelBottom
    />
  );
};
