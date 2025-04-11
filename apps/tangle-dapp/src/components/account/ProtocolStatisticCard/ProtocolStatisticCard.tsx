import { BN } from '@polkadot/util';
import { ArrowDownIcon, StatusIndicator } from '@tangle-network/icons';
import useVaultsPotAccounts from '@tangle-network/tangle-shared-ui/data/rewards/useVaultsPotAccounts';
import { useTokenPrices } from '@tangle-network/tangle-shared-ui/data/tokenPrices/useTokenPrices';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import safeFormatUnits from '@tangle-network/tangle-shared-ui/utils/safeFormatUnits';
import useLocalStorage, {
  LocalStorageKey,
} from '@tangle-network/tangle-shared-ui/hooks/useLocalStorage';
import {
  AmountFormatStyle,
  Card,
  CardVariant,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import Decimal from 'decimal.js';
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { map } from 'rxjs';
import { twMerge } from 'tailwind-merge';
import { StatsItem } from './StatsItem';

type Props = {
  className?: string;
  children?: ReactNode;
  isLoadingAssets: boolean;
  assets: Map<RestakeAssetId, RestakeAsset> | null;
  assetsTvl: Map<RestakeAssetId, BN> | null;
};

export const ProtocolStatisticCard: FC<Props> = ({
  className,
  children,
  assets,
  assetsTvl,
  isLoadingAssets,
}) => {
  const { data: tvlInUsd, isLoading } = useTvlInUsd(assets, assetsTvl);

  const { setWithPreviousValue: setTvlHistory, valueOpt: tvlHistoryOpt } =
    useLocalStorage(LocalStorageKey.TVL_HISTORY);

  const [tvlInUsdChangePercentage, setTvlInUsdChangePercentage] = useState(0);
  const [isUp, setIsUp] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const cleanup = () => {
      isMounted = false;
    };

    if (tvlInUsd === undefined) {
      return cleanup;
    }

    const now = new Date();

    const changeMetrics = calculateTvlChangeMetrics(
      tvlInUsd,
      now,
      tvlHistoryOpt?.value?.tvlInUsd,
      tvlHistoryOpt?.value?.timestamp,
    );

    if (changeMetrics === null) {
      return cleanup;
    }

    const oneDayTimestamp = 24 * 60 * 60 * 1000;
    const { change, lastUpdated } = changeMetrics;

    if (!isMounted) {
      return;
    }

    setTvlInUsdChangePercentage(change);
    setIsUp(change >= 0);

    // Update local storage if it's been more than 24 hours since last update
    const needUpdate = now.getTime() - oneDayTimestamp > lastUpdated.getTime();
    if (needUpdate && isMounted) {
      setTvlHistory((prev) => ({
        ...(prev?.value ?? {}),
        tvlInUsd: tvlInUsd.toString(),
        timestamp: now.getTime(),
      }));
    }

    return cleanup;
  }, [tvlInUsd, tvlHistoryOpt, setTvlHistory]);

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

          {isLoading && isLoadingAssets ? (
            <SkeletonLoader className="h-16 w-full max-w-36" />
          ) : (
            <div className="flex items-center gap-3 py-2">
              <Typography variant="h2" fw="bold" className="!leading-none">
                $
                {tvlInUsd !== undefined
                  ? formatDisplayAmount(tvlInUsd, 1, AmountFormatStyle.SI, {
                      fractionMaxLength: 2,
                    })
                  : EMPTY_VALUE_PLACEHOLDER}
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
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <RestakerCountStats />

          <OperatorCountStats />

          <VaultCountStats />
        </div>
      </div>

      {children}
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

function useTvlInUsd(
  assets: Map<RestakeAssetId, RestakeAsset> | null,
  assetsTvl: Map<RestakeAssetId, BN> | null,
) {
  const tokenSymbols = useMemo(() => {
    if (assets === null) {
      return null;
    }

    const tokenSymbolSet = new Set<string>();

    assets.forEach((asset) => {
      tokenSymbolSet.add(asset.metadata.symbol);
    });

    return tokenSymbolSet;
  }, [assets]);

  const { data: tokenPriceMap, ...rest } = useTokenPrices(tokenSymbols);

  const tvlInUsd = useMemo(() => {
    if (tokenPriceMap === undefined) {
      return;
    }

    if (assets === null || assetsTvl === null) {
      return;
    }

    let tvlInUsd = new Decimal(0);

    for (const asset of assets.values()) {
      const { id, metadata } = asset;

      const price = tokenPriceMap.get(metadata.symbol);
      if (!price) {
        continue;
      }

      const tvl = assetsTvl.get(id);
      if (tvl === undefined) {
        continue;
      }

      const fmtTvlResult = safeFormatUnits(
        () => BigInt(tvl.toString()),
        metadata.decimals,
      );

      if (fmtTvlResult.success === false) {
        continue;
      }

      tvlInUsd = tvlInUsd.add(new Decimal(fmtTvlResult.value).mul(price));
    }

    return new BN(tvlInUsd.floor().toString());
  }, [assets, assetsTvl, tokenPriceMap]);

  return {
    data: tvlInUsd,
    ...rest,
  };
}

function calculateTvlChangeMetrics(
  currentTvl: BN,
  currentDate: Date,
  lastTvlArg: string | undefined,
  lastUpdatedArg: number | undefined,
) {
  try {
    const currentTvlDecimal = new Decimal(currentTvl.toString(10));

    const lastTvl = lastTvlArg ? new Decimal(lastTvlArg) : currentTvlDecimal;

    if (lastTvl.eq(0)) {
      return null;
    }

    const lastUpdated = lastUpdatedArg ? new Date(lastUpdatedArg) : currentDate;

    // Calculate percentage change
    const change = currentTvlDecimal.sub(lastTvl).div(lastTvl).mul(100);

    return {
      change: Math.abs(change.toDP(2, Decimal.ROUND_FLOOR).toNumber()),
      lastUpdated,
      lastTvl,
    };
  } catch (error) {
    console.error('Error calculating TVL change percentage', error);
    return null;
  }
}
