import {
  type Operator,
  useOperators,
} from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { Button } from '@tangle-network/ui-components';
import { Search } from '@tangle-network/icons';
import {
  type ChangeEvent,
  type FC,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { type Address } from 'viem';
import { useNavigate } from 'react-router';
import { PagePath } from '../../types';
import { useAccount } from 'wagmi';
import {
  formatMoney,
  MetricStrip,
  Money,
  PageHeader,
  StatusPill,
  statusToneFor,
} from '../../components/chrome';
import type { Metric } from '../../components/chrome';
import DelegateModal from '../../components/DelegateModal';
import TangleCloudCard from '../../components/TangleCloudCard';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';

type SortKey = 'stake' | 'delegations' | 'status';
type SortDir = 'asc' | 'desc';

const Page: FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { data: operators, isLoading } = useOperators({
    fallbackToOnChain: false,
  });
  const operatorList = operators ?? [];
  const activeOperatorCount = operatorList.filter(
    (operator) => operator.stakingStatus === 'ACTIVE',
  ).length;
  const openOperatorCount = operatorList.filter(
    (operator) => operator.delegationMode === 2,
  ).length;
  const totalStake = operatorList.reduce(
    (total, operator) => total + (operator.stakingStake ?? 0n),
    0n,
  );

  const [delegateOpen, setDelegateOpen] = useState(false);
  const [delegateTarget, setDelegateTarget] = useState('');

  const handleStakeClicked = useCallback((operatorAddress?: Address) => {
    setDelegateTarget(operatorAddress ?? '');
    setDelegateOpen(true);
  }, []);

  const metrics: Metric[] = useMemo(
    () => [
      {
        label: 'Total',
        value: operatorList.length.toLocaleString(),
        sublabel: 'registered',
        loading: isLoading,
      },
      {
        label: 'Active',
        value: activeOperatorCount.toLocaleString(),
        tone: activeOperatorCount > 0 ? 'success' : 'neutral',
        sublabel:
          operatorList.length === 0
            ? '—'
            : `${Math.round(
                (activeOperatorCount / Math.max(1, operatorList.length)) * 100,
              )}% online`,
        loading: isLoading,
      },
      {
        label: 'Open',
        value: openOperatorCount.toLocaleString(),
        tone: openOperatorCount > 0 ? 'accent' : 'neutral',
        sublabel: 'accepting delegations',
        loading: isLoading,
      },
      {
        label: 'Total stake',
        value: formatMoney(totalStake, {
          decimals: 18,
          symbol: 'TNT',
          displayDecimals: 2,
        }).display,
        sublabel: 'TNT delegated',
        loading: isLoading,
      },
    ],
    [
      operatorList.length,
      activeOperatorCount,
      openOperatorCount,
      totalStake,
      isLoading,
    ],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        density="compact"
        title="Operators"
        subtitle="Inspect registered operators, delegation mode, stake, and RPC availability."
        action={
          <div className="flex gap-2">
            {isConnected && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(PagePath.OPERATORS_MANAGE)}
              >
                Manage operator
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStakeClicked()}
            >
              Delegate
            </Button>
          </div>
        }
      />

      <MetricStrip metrics={metrics} density="compact" />

      <OperatorsPanel
        operators={operatorList}
        isLoading={isLoading}
        onStakeClicked={handleStakeClicked}
        onManageClicked={() => navigate(PagePath.OPERATORS_MANAGE)}
      />

      <DelegateModal
        open={delegateOpen}
        onOpenChange={setDelegateOpen}
        operatorAddress={delegateTarget}
      />
    </div>
  );
};

export default Page;

const OperatorsPanel = ({
  operators,
  isLoading,
  onStakeClicked,
  onManageClicked,
}: {
  operators: Operator[];
  isLoading: boolean;
  onStakeClicked: (operatorAddress?: Address) => void;
  onManageClicked: (_operatorAddress: Address) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('stake');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredOperators = useMemo(() => {
    const matched =
      normalizedSearch === ''
        ? operators
        : operators.filter((operator) =>
            [
              operator.id,
              operator.rpcAddress,
              operator.ecdsaPublicKey,
              operator.stakingStatus,
              getDelegationModeLabel(operator.delegationMode),
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(normalizedSearch),
          );

    const sorted = [...matched].sort((a, b) => {
      const factor = sortDir === 'desc' ? -1 : 1;
      if (sortKey === 'stake') {
        const aStake = a.stakingStake ?? 0n;
        const bStake = b.stakingStake ?? 0n;
        return aStake === bStake ? 0 : aStake < bStake ? -factor : factor;
      }
      if (sortKey === 'delegations') {
        const aCount = a.stakingDelegationCount ?? 0n;
        const bCount = b.stakingDelegationCount ?? 0n;
        return aCount === bCount ? 0 : aCount < bCount ? -factor : factor;
      }
      const aActive = a.stakingStatus === 'ACTIVE' ? 1 : 0;
      const bActive = b.stakingStatus === 'ACTIVE' ? 1 : 0;
      return (aActive - bActive) * factor;
    });

    return sorted;
  }, [normalizedSearch, operators, sortDir, sortKey]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortKey(key);
    setSortDir('desc');
  };

  if (isLoading) {
    return (
      <TangleCloudCard className="space-y-3">
        <div className="h-11 w-full max-w-md animate-pulse rounded-lg bg-mono-40 dark:bg-mono-170" />
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-mono-40 dark:bg-mono-170"
          />
        ))}
      </TangleCloudCard>
    );
  }

  if (operators.length === 0) {
    return (
      <TangleCloudCard className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-3xl">{'⚙️'}</span>
        <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
          No operators indexed
        </Typography>
        <Typography
          variant="body2"
          className="max-w-sm text-mono-100 dark:text-mono-80"
        >
          Switch networks or wait for the indexer to sync. Operators appear
          automatically once they register on-chain.
        </Typography>
      </TangleCloudCard>
    );
  }

  return (
    <TangleCloudCard className="space-y-4">
      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-current text-mono-100 dark:text-mono-80" />
          <input
            value={searchQuery}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(event.currentTarget.value)
            }
            placeholder="Search by address, RPC, status, or mode"
            className="h-11 w-full rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190 pl-10 pr-3 text-sm text-mono-200 dark:text-mono-0 placeholder:text-mono-120 dark:placeholder:text-mono-100 outline-none focus:border-purple-40"
          />
        </div>
        <span className="text-sm text-mono-100 dark:text-mono-80">
          {filteredOperators.length} of {operators.length} operators
        </span>
      </div>

      {/* Table */}
      {filteredOperators.length === 0 ? (
        <div className="py-12 text-center">
          <Typography
            variant="body2"
            className="text-mono-100 dark:text-mono-80"
          >
            No operators match this search.
          </Typography>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-mono-60 dark:border-mono-170">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190">
                <th className="w-[36%] px-4 py-3 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-mono-100 dark:text-mono-80">
                    Operator
                  </span>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHead
                    label="Stake"
                    isActive={sortKey === 'stake'}
                    direction={sortDir}
                    onClick={() => onSort('stake')}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHead
                    label="Delegations"
                    isActive={sortKey === 'delegations'}
                    direction={sortDir}
                    onClick={() => onSort('delegations')}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-mono-100 dark:text-mono-80">
                    Mode
                  </span>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHead
                    label="Status"
                    isActive={sortKey === 'status'}
                    direction={sortDir}
                    onClick={() => onSort('status')}
                  />
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-mono-100 dark:text-mono-80">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOperators.map((operator) => (
                <OperatorTableRow
                  key={operator.id}
                  operator={operator}
                  onStakeClicked={onStakeClicked}
                  onManageClicked={onManageClicked}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TangleCloudCard>
  );
};

const SortableHead = ({
  label,
  isActive,
  direction,
  onClick,
}: {
  label: string;
  isActive: boolean;
  direction: SortDir;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors hover:text-mono-200 dark:hover:text-mono-0"
  >
    <span
      className={
        isActive
          ? 'text-mono-200 dark:text-mono-0'
          : 'text-mono-100 dark:text-mono-80'
      }
    >
      {label}
    </span>
    <span className={isActive ? 'text-purple-40' : 'text-mono-100/40'}>
      {isActive ? (direction === 'desc' ? '↓' : '↑') : '↕'}
    </span>
  </button>
);

const OperatorTableRow = ({
  operator,
  onStakeClicked,
  onManageClicked,
}: {
  operator: Operator;
  onStakeClicked: (operatorAddress?: Address) => void;
  onManageClicked: (_operatorAddress: Address) => void;
}) => {
  const address = operator.id as Address;
  const status = operator.stakingStatus ?? 'INACTIVE';
  const rpcHost = getRpcHost(operator.rpcAddress);
  const delegationMode = operator.delegationMode;
  const delegationModeLabel = getDelegationModeLabel(delegationMode);
  const accentColor = getOperatorAccent(address);

  return (
    <tr className="group border-b border-mono-60/50 dark:border-mono-170/50 transition-colors last:border-0 hover:bg-mono-20/60 dark:hover:bg-mono-190/60">
      <td className="px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`h-8 w-1 shrink-0 rounded-full ${accentColor}`} />
          <OperatorIdenticon address={address} accentColor={accentColor} />
          <div className="min-w-0">
            <p className="truncate font-display font-bold text-sm text-mono-200 dark:text-mono-0">
              {shortenAddress(address)}
            </p>
            <p className="mt-0.5 truncate font-mono text-xs text-mono-100 dark:text-mono-80">
              {rpcHost ?? 'No RPC advertised'}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <Money
          value={operator.stakingStake}
          options={{ decimals: 18, symbol: 'TNT', displayDecimals: 2 }}
          align="left"
        />
      </td>
      <td className="px-4 py-3.5 text-sm font-semibold text-mono-200 dark:text-mono-0">
        {formatCount(operator.stakingDelegationCount)}
      </td>
      <td className="px-4 py-3.5">
        <StatusPill tone={getDelegationModeTone(delegationMode)}>
          {delegationModeLabel}
        </StatusPill>
      </td>
      <td className="px-4 py-3.5">
        <StatusPill tone={statusToneFor('operator', status)}>
          {formatStatus(status)}
        </StatusPill>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex justify-end gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onStakeClicked(address)}
          >
            Stake
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onManageClicked(address)}
          >
            Manage
          </Button>
        </div>
      </td>
    </tr>
  );
};

const OperatorIdenticon = ({
  address,
  accentColor,
}: {
  address: string;
  accentColor: string;
}) => (
  <div
    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 ${accentColor.replace('bg-', 'border-').replace('/60', '/40')} bg-mono-20 dark:bg-mono-190 font-display font-extrabold text-xs text-mono-200 dark:text-mono-0`}
  >
    {address.slice(2, 4).toUpperCase()}
  </div>
);

const shortenAddress = (address: string) => {
  if (address.length <= 16) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatCount = (value: bigint | null) =>
  value === null ? '-' : value.toLocaleString();

const hashAddress = (address: string) =>
  Array.from(address).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 997;
  }, 0);

const OPERATOR_ACCENTS = [
  'bg-purple-40/60',
  'bg-emerald-50/60',
  'bg-amber-50/60',
  'bg-blue-40/60',
] as const;

const getOperatorAccent = (address: string) =>
  OPERATOR_ACCENTS[hashAddress(address) % OPERATOR_ACCENTS.length];

const getDelegationModeTone = (mode: number | null) =>
  statusToneFor(
    'availability',
    mode === 2 ? 'Available' : mode === 1 ? 'Limited' : 'Unavailable',
  );

const getDelegationModeLabel = (mode: number | null) => {
  if (mode === 2) return 'Open';
  if (mode === 1) return 'Whitelist';
  return 'Closed';
};

const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getRpcHost = (value: string | null) => {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
};
