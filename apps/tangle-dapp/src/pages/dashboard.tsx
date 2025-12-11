import { TokenIcon } from '@tangle-network/icons';
import {
  useRestakeAssets,
  useRestakingAssets,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useDelegator } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components';
import { Card } from '@tangle-network/ui-components';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import { BN } from '@polkadot/util';
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
  const {
    assets,
    assetList,
    isLoading: isLoadingAssets,
    source,
  } = useRestakeAssets();

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

        <Card className="p-4">
          {isLoadingAssets ? (
            <div className="flex items-center justify-center py-8">
              <Typography variant="body1" className="text-mono-100">
                Loading assets...
              </Typography>
            </div>
          ) : assetList.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Typography variant="body1" className="text-mono-100">
                No restakable assets found (source: {source})
              </Typography>
            </div>
          ) : (
            <div className="space-y-3">
              {assetList.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-mono-20 dark:bg-mono-170"
                >
                  <div className="flex items-center gap-3">
                    <TokenIcon name={asset.metadata.symbol} size="lg" />

                    <div>
                      <Typography variant="body1" fw="bold">
                        {asset.metadata.symbol}
                      </Typography>

                      <Typography
                        variant="body2"
                        className="text-mono-100 dark:text-mono-100"
                      >
                        {asset.metadata.name}
                      </Typography>
                    </div>
                  </div>

                  <div className="text-right">
                    <Typography variant="body1" fw="bold">
                      {formatDisplayAmount(
                        new BN(asset.balance.toString()),
                        asset.metadata.decimals,
                        AmountFormatStyle.SHORT,
                      )}
                    </Typography>

                    <Typography
                      variant="body2"
                      className="text-mono-100 dark:text-mono-100"
                    >
                      Balance
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </NetworkGuard>
  );
};

export default DashboardPage;
