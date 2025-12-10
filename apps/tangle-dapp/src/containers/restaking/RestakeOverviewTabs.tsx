import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { TabContent } from '@tangle-network/ui-components/components/Tabs/TabContent';
import { type FC, useCallback, useState } from 'react';
import { Address, formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import {
  useVaultsTableProps,
  VaultsTable,
} from '../../components/tables/Vaults';
import { RestakeAction } from '../../constants';
import BlueprintListing from '../../pages/blueprints/BlueprintListing';
import RestakeDelegateForm from '../../pages/restake/delegate';
import DepositForm from '../../pages/restake/deposit/DepositForm';
import RestakeUnstakeForm from '../../pages/restake/unstake';
import RestakeWithdrawForm from '../../pages/restake/withdraw';
import { PagePath, QueryParamKey } from '../../types';

// EVM hooks
import {
  useDelegator,
  useRestakingAssets,
  type Operator,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';

enum RestakeTab {
  RESTAKE = 'Restake',
  VAULTS = 'Vaults',
  OPERATORS = 'Operators',
  BLUEPRINTS = 'Blueprints',
}

type Props = {
  operatorMap: Map<Address, Operator> | null;
  action: RestakeAction;
  onOperatorJoined?: () => void;
};

const RestakeOverviewTabs: FC<Props> = ({
  operatorMap,
  action,
  onOperatorJoined,
}) => {
  const [tab, setTab] = useState(RestakeTab.RESTAKE);

  const handleRestakeClicked = useCallback(() => {
    setTab(RestakeTab.RESTAKE);
  }, []);

  return (
    <TableAndChartTabs
      tabs={Object.values(RestakeTab)}
      value={tab}
      onValueChange={(tab) => setTab(tab as RestakeTab)}
      headerClassName="w-full"
      className="space-y-9"
    >
      <TabContent
        value={RestakeTab.RESTAKE}
        className="flex justify-center md:min-w-[480px] mx-auto"
      >
        {action === RestakeAction.DEPOSIT ? (
          <DepositForm />
        ) : action === RestakeAction.WITHDRAW ? (
          <RestakeWithdrawForm />
        ) : action === RestakeAction.DELEGATE ? (
          <RestakeDelegateForm />
        ) : action === RestakeAction.UNDELEGATE ? (
          <RestakeUnstakeForm />
        ) : null}
      </TabContent>

      <TabContent value={RestakeTab.VAULTS}>
        <VaultTabContent />
      </TabContent>

      <TabContent value={RestakeTab.OPERATORS}>
        <OperatorsTable
          operatorMap={operatorMap}
          onRestakeClicked={handleRestakeClicked}
          onOperatorJoined={onOperatorJoined}
        />
      </TabContent>

      <TabContent value={RestakeTab.BLUEPRINTS}>
        <BlueprintListing />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default RestakeOverviewTabs;

// EVM Vault tab content
const VaultTabContent: FC = () => {
  const { address: userAddress } = useAccount();
  const { data: delegator, isLoading: isLoadingDelegator } = useDelegator(userAddress);
  const { data: restakingAssets, isLoading: isLoadingAssets } = useRestakingAssets();

  // Get token addresses for metadata
  const tokenAddresses = restakingAssets?.map((a) => a.token as EvmAddress) ?? [];
  const { data: tokenMetadatas } = useEvmAssetMetadatas(tokenAddresses);

  // Build vault data from restaking assets
  const vaults = restakingAssets?.map((asset) => {
    const metadata = tokenMetadatas?.find(
      (m) => m.id.toLowerCase() === asset.token.toLowerCase(),
    );

    const userDeposit = delegator?.assetPositions.find(
      (p) => p.token.toLowerCase() === asset.token.toLowerCase(),
    );

    return {
      id: asset.token,
      name: metadata?.name ?? 'Unknown',
      symbol: metadata?.symbol ?? '???',
      decimals: metadata?.decimals ?? 18,
      tvl: asset.currentDeposits,
      userDeposit: userDeposit?.totalDeposited ?? 0n,
      minStake: asset.minStake,
      depositCap: asset.depositCap,
      rewardMultiplier: asset.rewardMultiplier,
    };
  }) ?? [];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left border-b border-mono-60 dark:border-mono-140">
              <th className="px-4 py-3 text-sm font-medium text-mono-120">Asset</th>
              <th className="px-4 py-3 text-sm font-medium text-mono-120">TVL</th>
              <th className="px-4 py-3 text-sm font-medium text-mono-120">Your Deposit</th>
              <th className="px-4 py-3 text-sm font-medium text-mono-120">Multiplier</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingAssets ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-mono-100">
                  Loading vaults...
                </td>
              </tr>
            ) : vaults.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-mono-100">
                  No vaults available
                </td>
              </tr>
            ) : (
              vaults.map((vault) => (
                <tr
                  key={vault.id}
                  className="border-b border-mono-40 dark:border-mono-160"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{vault.symbol}</span>
                      <span className="text-xs text-mono-100">{vault.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {formatUnits(vault.tvl, vault.decimals)} {vault.symbol}
                  </td>
                  <td className="px-4 py-3">
                    {vault.userDeposit > 0n
                      ? `${formatUnits(vault.userDeposit, vault.decimals)} ${vault.symbol}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {vault.rewardMultiplier}x
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// EVM Operators table
type OperatorsTableProps = {
  operatorMap: Map<Address, Operator> | null;
  onRestakeClicked: () => void;
  onOperatorJoined?: () => void;
};

const OperatorsTable: FC<OperatorsTableProps> = ({
  operatorMap,
  onRestakeClicked,
  onOperatorJoined,
}) => {
  const operators = operatorMap ? Array.from(operatorMap.values()) : [];
  const isLoading = operatorMap === null;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left border-b border-mono-60 dark:border-mono-140">
              <th className="px-4 py-3 text-sm font-medium text-mono-120">Operator</th>
              <th className="px-4 py-3 text-sm font-medium text-mono-120">Status</th>
              <th className="px-4 py-3 text-sm font-medium text-mono-120">Stake</th>
              <th className="px-4 py-3 text-sm font-medium text-mono-120">Delegations</th>
              <th className="px-4 py-3 text-sm font-medium text-mono-120">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-mono-100">
                  Loading operators...
                </td>
              </tr>
            ) : operators.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-mono-100">
                  No operators registered yet
                </td>
              </tr>
            ) : (
              operators.map((operator) => (
                <tr
                  key={operator.id}
                  className="border-b border-mono-40 dark:border-mono-160"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm">
                      {operator.id.slice(0, 10)}...{operator.id.slice(-8)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        operator.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-mono-80 text-mono-120'
                      }`}
                    >
                      {operator.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatUnits(operator.stake, 18)} TNT
                  </td>
                  <td className="px-4 py-3">
                    {operator.delegationCount}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`${PagePath.RESTAKE_DELEGATE}?${QueryParamKey.RESTAKE_OPERATOR}=${operator.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onRestakeClicked();
                        window.history.pushState(
                          {},
                          '',
                          `${PagePath.RESTAKE_DELEGATE}?${QueryParamKey.RESTAKE_OPERATOR}=${operator.id}`,
                        );
                      }}
                      className="text-sm text-blue-50 hover:text-blue-40"
                    >
                      Delegate
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
