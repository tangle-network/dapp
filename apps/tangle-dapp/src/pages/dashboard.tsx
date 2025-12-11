import {
  useRestakeAssets,
  useRestakingAssets,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useDelegator } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import { FC, useMemo } from 'react';
import { useAccount } from 'wagmi';
import AccountSummaryCard from '../components/account/AccountSummaryCard';
import { ProtocolStatisticCard } from '../components/account/ProtocolStatisticCard';
import { UserRestakingOverview } from '../components/restaking/UserRestakingOverview';
import { NetworkGuard } from '../components/NetworkGuard';

const DashboardPage: FC = () => {
  const { address } = useAccount();

  // Fetch restaking assets (tokens that can be restaked)
  const { data: restakingAssets, isLoading: isLoadingRestakingAssets } =
    useRestakingAssets();

  // Fetch assets with user balances
  const { assets, isLoading: isLoadingAssets } = useRestakeAssets();

  // Fetch delegator info for the connected user
  const { data: delegatorInfo, isLoading: isLoadingDelegator } =
    useDelegator(address);

  // Calculate TVL from restaking assets
  const tvlData = useMemo(() => {
    if (!restakingAssets) return null;
    const totalDeposits = restakingAssets.reduce(
      (sum, asset) => sum + asset.currentDeposits,
      BigInt(0),
    );
    return { totalDeposits, assetCount: restakingAssets.length };
  }, [restakingAssets]);

  const isLoading = isLoadingRestakingAssets || isLoadingAssets;

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

        {/* Asset list will show from UserRestakingOverview */}
      </div>
    </NetworkGuard>
  );
};

export default DashboardPage;
