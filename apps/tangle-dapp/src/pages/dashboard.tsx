import { useRestakingOverview } from '@tangle-network/tangle-shared-ui/data/restake/useRestakingData';
// import { useTokenUsdPrices } from '@tangle-network/tangle-shared-ui/data/tokenPrices/useTokenUsdPrices';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import { FC, useMemo, useCallback } from 'react';
import { formatUnits } from 'viem';
import AccountSummaryCard from '../components/account/AccountSummaryCard';
import { ProtocolStatisticCard } from '../components/account/ProtocolStatisticCard';
import { UserRestakingOverview } from '../components/restaking/UserRestakingOverview';
import { NetworkGuard } from '../components/NetworkGuard';
import TntBreakdownCard from '../components/account/TntBreakdownCard';
import RestakingAssetsTable from '../components/tables/RestakingAssetsTable';
import useUserRestakingStats from '../data/restaking/useUserRestakingStats';

const DashboardPage: FC = () => {
  // Use the unified restaking data hook
  const {
    assets,
    assetList,
    restakingAssets,
    delegator: delegatorInfo,
    isLoading,
    isLoadingAssets,
    isLoadingDelegator,
    assetCount,
  } = useRestakingOverview();
  const { data: restakingStats, isLoading: isRestakingStatsLoading } =
    useUserRestakingStats();

  // const tokensForPricing = useMemo(() => {
  //   if (restakingAssets === null || assets === null) {
  //     return null;
  //   }

  //   return restakingAssets.map((asset) => {
  //     const meta = assets.get(asset.token);
  //     return {
  //       address: asset.token.toLowerCase() as `0x${string}`,
  //       symbol: meta?.metadata.symbol ?? null,
  //     };
  //   });
  // }, [assets, restakingAssets]);

  // const { data: tokenUsdPrices } = useTokenUsdPrices(tokensForPricing);

  const protocolTvl = useMemo(() => {
    if (!restakingAssets) {
      return BigInt(0);
    }

    let total = BigInt(0);
    for (const asset of restakingAssets) {
      total += asset.currentDeposits;
    }

    return total;
  }, [restakingAssets]);

  // const protocolTvlUsd = useMemo(() => {
  //   if (!restakingAssets || !assets) {
  //     return 0;
  //   }

  //   let total = 0;
  //   for (const asset of restakingAssets) {
  //     const meta = assets.get(asset.token);
  //     const decimals = meta?.metadata.decimals ?? 18;
  //     const priceUsd =
  //       tokenUsdPrices?.get(asset.token.toLowerCase() as `0x${string}`) ?? 1;

  //     const amount = Number(formatUnits(asset.currentDeposits, decimals));
  //     if (!Number.isFinite(amount)) {
  //       continue;
  //     }

  //     total += amount * priceUsd;
  //   }

  //   return total;
  // }, [assets, restakingAssets, tokenUsdPrices]);

  // Calculate TVL data for ProtocolStatisticCard
  const tvlData = useMemo(
    () => ({ totalDeposits: protocolTvl, assetCount }),
    [protocolTvl, assetCount],
  );

  const tntAsset = useMemo(() => {
    const endsWithTnt = (symbol: string) =>
      symbol.toLowerCase().endsWith('tnt');

    return (
      assetList.find((asset) => endsWithTnt(asset.metadata.symbol)) ?? null
    );
  }, [assetList]);

  const tntPosition = useMemo(() => {
    if (!delegatorInfo || !tntAsset) {
      return null;
    }
    const tokenKey = tntAsset.id.toLowerCase();
    return (
      delegatorInfo.assetPositions.find(
        (pos) => pos.token.toLowerCase() === tokenKey,
      ) ?? null
    );
  }, [delegatorInfo, tntAsset]);

  const walletTnt = tntAsset?.balance ?? BigInt(0);
  const restakedTnt = tntPosition?.totalDeposited ?? BigInt(0);
  const delegatedTnt = tntPosition?.delegatedAmount ?? BigInt(0);
  const availableRestaked =
    restakedTnt > delegatedTnt ? restakedTnt - delegatedTnt : BigInt(0);
  const tntRewards = restakingStats?.pendingRewards ?? BigInt(0);
  const tntDecimals = tntAsset?.metadata.decimals ?? 18;
  const tntSymbol = tntAsset?.metadata.symbol ?? 'TNT';

  const formatTokenAmount = useCallback((value: bigint, decimals?: number) => {
    if (decimals === undefined) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    const formatted = formatUnits(value, decimals);
    const num = Number.parseFloat(formatted);
    if (!Number.isFinite(num)) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    if (num === 0) return '0';
    if (Math.abs(num) < 0.0001 && num > 0) return '< 0.0001';
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 4,
      minimumFractionDigits: 0,
    });
  }, []);

  const tntBreakdown = useMemo(
    () => ({
      wallet: formatTokenAmount(walletTnt, tntDecimals),
      restaked: formatTokenAmount(restakedTnt, tntDecimals),
      delegated: formatTokenAmount(delegatedTnt, tntDecimals),
      available: formatTokenAmount(availableRestaked, tntDecimals),
      rewards: formatTokenAmount(tntRewards, tntDecimals),
    }),
    [
      walletTnt,
      restakedTnt,
      delegatedTnt,
      availableRestaked,
      tntRewards,
      tntDecimals,
      formatTokenAmount,
    ],
  );

  const isTntBreakdownLoading =
    isLoadingAssets || isLoadingDelegator || isRestakingStatsLoading;

  return (
    <NetworkGuard>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AccountSummaryCard className="md:max-w-none" />

          <ProtocolStatisticCard
            isLoading={isLoading}
            restakingAssets={restakingAssets ?? []}
            tvlData={tvlData}
          />
        </div>

        <TntBreakdownCard
          symbol={tntSymbol}
          walletValue={tntBreakdown.wallet}
          restakedValue={tntBreakdown.restaked}
          delegatedValue={tntBreakdown.delegated}
          availableValue={tntBreakdown.available}
          rewardsValue={tntBreakdown.rewards}
          isLoading={isTntBreakdownLoading}
        />

        <Typography variant="h4" fw="bold">
          Your Position
        </Typography>

        <UserRestakingOverview
          delegator={delegatorInfo ?? null}
          assets={assets}
          isLoading={isLoadingDelegator || isLoadingAssets}
        />

        <Typography variant="h4" fw="bold">
          Restake Assets
        </Typography>

        <RestakingAssetsTable
          assets={assetList}
          restakingAssets={restakingAssets ?? []}
          delegator={delegatorInfo}
          isLoading={isLoading || isLoadingAssets || isLoadingDelegator}
        />
      </div>
    </NetworkGuard>
  );
};

export default DashboardPage;
