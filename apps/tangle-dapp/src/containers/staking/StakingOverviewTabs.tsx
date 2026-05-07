import { BN } from '@polkadot/util';
import { TokenIcon } from '@tangle-network/icons';
import Spinner from '@tangle-network/icons/Spinner';
import {
  useDelegator,
  useProtocolStakingAssets as useStakingAssets,
  type Operator,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import HeaderCell from '@tangle-network/tangle-shared-ui/components/tables/HeaderCell';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import {
  AmountFormatStyle,
  CopyWithTooltip,
  formatDisplayAmount,
  EMPTY_VALUE_PLACEHOLDER,
  shortenHex,
} from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Table } from '@tangle-network/ui-components/components/Table';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { TabContent } from '@tangle-network/ui-components/components/Tabs/TabContent';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { type FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { StakingAction } from '../../constants';
import { ClaimableRewardsCard } from '../../components/staking';
import BlueprintListing from '../../pages/blueprints/BlueprintListing';
import StakingDelegateForm from '../../pages/staking/delegate';
import DepositForm from '../../pages/staking/deposit/DepositForm';
import StakingUndelegateForm from '../../pages/staking/undelegate';
import StakingWithdrawForm from '../../pages/staking/withdraw';
import { PagePath, QueryParamKey } from '../../types';

enum StakingTab {
  STAKING = 'Stake',
  VAULTS = 'Vaults',
  OPERATORS = 'Operators',
  BLUEPRINTS = 'Blueprints',
}

type Props = {
  operatorMap: Map<Address, Operator> | null;
  action: StakingAction;
  onOperatorJoined?: () => void;
};

const StakingOverviewTabs: FC<Props> = ({
  operatorMap,
  action,
  onOperatorJoined,
}) => {
  const [tab, setTab] = useState(StakingTab.STAKING);

  const handleStakingClicked = useCallback(() => {
    setTab(StakingTab.STAKING);
  }, []);

  return (
    <TableAndChartTabs
      tabs={Object.values(StakingTab)}
      value={tab}
      onValueChange={(tab) => setTab(tab as StakingTab)}
      headerClassName="w-full"
      className="space-y-9"
    >
      <TabContent
        value={StakingTab.STAKING}
        className="w-full max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left column - Action forms */}
          <div className="flex justify-center">
            {action === StakingAction.DEPOSIT ? (
              <DepositForm />
            ) : action === StakingAction.WITHDRAW ? (
              <StakingWithdrawForm />
            ) : action === StakingAction.DELEGATE ? (
              <StakingDelegateForm />
            ) : action === StakingAction.UNDELEGATE ? (
              <StakingUndelegateForm />
            ) : null}
          </div>

          {/* Right column - Rewards card */}
          <div className="lg:pt-0">
            <ClaimableRewardsCard />
          </div>
        </div>
      </TabContent>

      <TabContent value={StakingTab.VAULTS}>
        <VaultTabContent />
      </TabContent>

      <TabContent value={StakingTab.OPERATORS}>
        <OperatorsTable
          operatorMap={operatorMap}
          onStakingClicked={handleStakingClicked}
          onOperatorJoined={onOperatorJoined}
        />
      </TabContent>

      <TabContent value={StakingTab.BLUEPRINTS}>
        <BlueprintListing />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default StakingOverviewTabs;

// Vault row type
interface VaultRow {
  id: Address;
  name: string;
  symbol: string;
  decimals: number;
  tvl: bigint;
  userDeposit: bigint;
  rewardMultiplier: number;
}

type ProtocolStakingAssetLike = {
  token: Address;
  currentDeposits: bigint;
  rewardMultiplierBps: number;
};

const VAULT_COLUMN_HELPER = createColumnHelper<VaultRow>();

const getVaultColumns = () => [
  VAULT_COLUMN_HELPER.accessor('id', {
    header: () => <HeaderCell title="Asset" />,
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10">
            <TokenIcon name={props.row.original.symbol} size="xl" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Typography variant="h5" className="whitespace-nowrap">
                {props.row.original.symbol}
              </Typography>

              <Typography
                variant="body3"
                className="text-mono-120 dark:text-mono-100 truncate"
              >
                {props.row.original.name}
              </Typography>
            </div>

            <div className="flex items-center gap-2 text-mono-120 dark:text-mono-100">
              <Typography variant="body4" className="font-mono">
                {shortenHex(props.row.original.id)}
              </Typography>
              <CopyWithTooltip
                textToCopy={props.row.original.id}
                isButton={false}
                copyLabel="Copy address"
              />
            </div>
          </div>
        </div>
      </TableCellWrapper>
    ),
  }),
  VAULT_COLUMN_HELPER.accessor('tvl', {
    header: () => <HeaderCell title="TVL" />,
    cell: (props) => (
      <TableCellWrapper>
        {formatDisplayAmount(
          new BN(props.getValue().toString()),
          props.row.original.decimals,
          AmountFormatStyle.SHORT,
        )}
      </TableCellWrapper>
    ),
  }),
  VAULT_COLUMN_HELPER.accessor('userDeposit', {
    header: () => <HeaderCell title="Your Deposit" />,
    cell: (props) => {
      const value = props.getValue();
      return (
        <TableCellWrapper>
          {value > BigInt(0)
            ? formatDisplayAmount(
                new BN(value.toString()),
                props.row.original.decimals,
                AmountFormatStyle.SHORT,
              )
            : EMPTY_VALUE_PLACEHOLDER}
        </TableCellWrapper>
      );
    },
  }),
  VAULT_COLUMN_HELPER.accessor('rewardMultiplier', {
    header: () => <HeaderCell title="Multiplier" />,
    cell: (props) => (
      <TableCellWrapper removeRightBorder>{props.getValue()}x</TableCellWrapper>
    ),
  }),
];

// EVM Vault tab content
const VaultTabContent: FC = () => {
  const { address: userAddress } = useAccount();
  const { data: delegator } = useDelegator(userAddress);
  const { data: stakingAssets, isLoading: isLoadingAssets } =
    useStakingAssets();
  const protocolStakingAssets = useMemo<ProtocolStakingAssetLike[]>(() => {
    return (stakingAssets ?? []) as ProtocolStakingAssetLike[];
  }, [stakingAssets]);

  // Get token addresses for metadata
  const tokenAddresses = protocolStakingAssets.map(
    (asset) => asset.token as EvmAddress,
  );
  const { data: tokenMetadatas } = useEvmAssetMetadatas(tokenAddresses);

  // Build vault data from staking assets
  const vaults = useMemo<VaultRow[]>(() => {
    if (protocolStakingAssets.length === 0) return [];
    return protocolStakingAssets.map((asset) => {
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
        userDeposit: userDeposit?.totalDeposited ?? BigInt(0),
        rewardMultiplier: asset.rewardMultiplierBps / 10000,
      };
    });
  }, [protocolStakingAssets, tokenMetadatas, delegator]);

  const columns = useMemo(() => getVaultColumns(), []);

  const table = useReactTable({
    data: vaults,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  if (isLoadingAssets && vaults.length === 0) {
    return (
      <TableStatus
        title="Loading Vaults"
        description="Please wait while we load the vaults."
        icon={<Spinner size="lg" />}
      />
    );
  }

  if (vaults.length === 0) {
    return (
      <TableStatus
        title="No Vaults Found"
        description="It looks like there are no vaults available at the moment."
      />
    );
  }

  return (
    <Table
      variant={TableVariant.GLASS_OUTER}
      title={pluralize('vault', vaults.length !== 1)}
      isPaginated
      tableProps={table}
      className="px-2"
      tableWrapperClassName="py-2"
      tableClassName="border-collapse border-spacing-0"
      thClassName="py-2"
      tbodyClassName={twMerge(
        '[&_tr:first-child_td:first-child]:rounded-tl-xl [&_tr:first-child_td:last-child]:rounded-tr-xl',
        '[&_tr:last-child_td:first-child]:rounded-bl-xl [&_tr:last-child_td:last-child]:rounded-br-xl',
      )}
      trClassName="last:border-b-0"
      tdClassName="first:rounded-l-none last:rounded-r-none"
    />
  );
};

// Operator row type
interface OperatorRow {
  id: Address;
  status: string;
  stake: bigint;
  delegationCount: number;
}

const OPERATOR_COLUMN_HELPER = createColumnHelper<OperatorRow>();

const getOperatorColumns = (onStakingClicked: () => void) => [
  OPERATOR_COLUMN_HELPER.accessor('id', {
    header: () => <HeaderCell title="Operator" />,
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <Typography variant="body2" className="font-mono">
            {shortenHex(props.getValue())}
          </Typography>
          <CopyWithTooltip textToCopy={props.getValue()} isButton={false} />
        </div>
      </TableCellWrapper>
    ),
  }),
  OPERATOR_COLUMN_HELPER.accessor('status', {
    header: () => <HeaderCell title="Status" />,
    cell: (props) => {
      const status = props.getValue();
      return (
        <TableCellWrapper>
          <span
            className={twMerge(
              'px-2 py-1 text-xs rounded',
              status === 'ACTIVE'
                ? 'bg-green-500/20 text-green-500'
                : 'bg-mono-80 text-mono-120',
            )}
          >
            {status}
          </span>
        </TableCellWrapper>
      );
    },
  }),
  OPERATOR_COLUMN_HELPER.accessor('stake', {
    header: () => <HeaderCell title="Stake" />,
    cell: (props) => (
      <TableCellWrapper>
        {formatDisplayAmount(
          new BN(props.getValue().toString()),
          18,
          AmountFormatStyle.SHORT,
        )}{' '}
        TNT
      </TableCellWrapper>
    ),
  }),
  OPERATOR_COLUMN_HELPER.accessor('delegationCount', {
    header: () => <HeaderCell title="Total Delegations" />,
    cell: (props) => <TableCellWrapper>{props.getValue()}</TableCellWrapper>,
  }),
  OPERATOR_COLUMN_HELPER.display({
    id: 'actions',
    header: () => <HeaderCell title="Actions" />,
    cell: (props) => (
      <TableCellWrapper removeRightBorder>
        <Button
          variant="utility"
          size="sm"
          onClick={() => {
            onStakingClicked();
            window.history.pushState(
              {},
              '',
              `${PagePath.STAKING_DELEGATE}?${QueryParamKey.STAKING_OPERATOR}=${props.row.original.id}`,
            );
          }}
        >
          Delegate
        </Button>
      </TableCellWrapper>
    ),
  }),
];

// EVM Operators table
type OperatorsTableProps = {
  operatorMap: Map<Address, Operator> | null;
  onStakingClicked: () => void;
  onOperatorJoined?: () => void;
};

const OperatorsTable: FC<OperatorsTableProps> = ({
  operatorMap,
  onStakingClicked,
}) => {
  const isLoading = operatorMap === null;

  const operators = useMemo<OperatorRow[]>(() => {
    if (!operatorMap) return [];
    return Array.from(operatorMap.values()).map((op) => ({
      id: op.id as Address,
      status: op.stakingStatus ?? 'UNKNOWN',
      stake: op.stakingStake ?? BigInt(0),
      delegationCount: Number(op.stakingDelegationCount ?? 0),
    }));
  }, [operatorMap]);

  const columns = useMemo(
    () => getOperatorColumns(onStakingClicked),
    [onStakingClicked],
  );

  const table = useReactTable({
    data: operators,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  if (isLoading) {
    return (
      <TableStatus
        title="Loading Operators"
        description="Please wait while we load the operators."
        icon={<Spinner size="lg" />}
      />
    );
  }

  if (operators.length === 0) {
    return (
      <TableStatus
        title="No Operators Found"
        description="It looks like there are no operators registered yet."
      />
    );
  }

  return (
    <Table
      variant={TableVariant.GLASS_OUTER}
      title={pluralize('operator', operators.length !== 1)}
      isPaginated
      tableProps={table}
      className="px-2"
      tableWrapperClassName="py-2"
      tableClassName="border-collapse border-spacing-0"
      thClassName="py-2"
      tbodyClassName={twMerge(
        '[&_tr:first-child_td:first-child]:rounded-tl-xl [&_tr:first-child_td:last-child]:rounded-tr-xl',
        '[&_tr:last-child_td:first-child]:rounded-bl-xl [&_tr:last-child_td:last-child]:rounded-br-xl',
      )}
      trClassName="last:border-b-0"
      tdClassName="first:rounded-l-none last:rounded-r-none"
    />
  );
};
