import {
  type Operator,
  useOperators,
} from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tangle-network/sandbox-ui/primitives';
import { Search } from '@tangle-network/icons';
import {
  type ChangeEvent,
  type CSSProperties,
  type FC,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { formatUnits, type Address } from 'viem';
import { useNavigate } from 'react-router';
import { PagePath } from '../../types';
import { useAccount } from 'wagmi';
import { MetricStrip, PageHeader } from '../../components/chrome';
import type { Metric } from '../../components/chrome';
import createStakeDelegateUrl from './createStakeDelegateUrl';

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

  const handleStakeClicked = useCallback((operatorAddress?: Address) => {
    window.location.assign(createStakeDelegateUrl(operatorAddress));
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
        value: formatStake(totalStake),
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
          <>
            {isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(PagePath.OPERATORS_MANAGE)}
              >
                Manage operator
              </Button>
            )}
            <Button
              variant="sandbox"
              size="sm"
              onClick={() => handleStakeClicked()}
            >
              Delegate
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} density="compact" />

      <OperatorsPanel
        operators={operatorList}
        isLoading={isLoading}
        onStakeClicked={handleStakeClicked}
        onManageClicked={() => navigate(PagePath.OPERATORS_MANAGE)}
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
  onManageClicked: (operatorAddress: Address) => void;
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
      // status: active first when desc
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
      <Card variant="sandbox">
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-11 w-full max-w-md rounded-md" />
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (operators.length === 0) {
    return (
      <Card variant="sandbox">
        <CardContent className="p-6">
          <EmptyState
            icon={<span className="text-3xl">{'⚙️'}</span>}
            title="No operators indexed"
            description="Switch networks or wait for the indexer to sync. Operators are picked up automatically once they register on-chain."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="sandbox">
      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-current text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(event.currentTarget.value)
              }
              placeholder="Search by address, RPC, status, or mode"
              className="h-11 bg-background pl-10 text-sm"
            />
          </div>
          <span className="text-muted-foreground text-sm">
            {filteredOperators.length} of {operators.length} operators
          </span>
        </div>

        {filteredOperators.length === 0 ? (
          <EmptyState
            title="No operators match this search"
            description="Try an address fragment, RPC host, status (active/inactive), or mode (open/whitelist)."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-elevated)]/60">
                  <TableHead className="w-[36%] font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    Operator
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    <SortableHead
                      label="Stake"
                      isActive={sortKey === 'stake'}
                      direction={sortDir}
                      onClick={() => onSort('stake')}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    <SortableHead
                      label="Delegations"
                      isActive={sortKey === 'delegations'}
                      direction={sortDir}
                      onClick={() => onSort('delegations')}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    Mode
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    <SortableHead
                      label="Status"
                      isActive={sortKey === 'status'}
                      direction={sortDir}
                      onClick={() => onSort('status')}
                    />
                  </TableHead>
                  <TableHead className="text-right font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperators.map((operator) => (
                  <OperatorTableRow
                    key={operator.id}
                    operator={operator}
                    onStakeClicked={onStakeClicked}
                    onManageClicked={onManageClicked}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
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
    className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider transition-colors hover:text-foreground"
  >
    {label}
    <span
      aria-hidden
      className={isActive ? 'text-foreground' : 'text-muted-foreground/40'}
    >
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
  onManageClicked: (operatorAddress: Address) => void;
}) => {
  const address = operator.id as Address;
  const status = operator.stakingStatus ?? 'INACTIVE';
  const rpcHost = getRpcHost(operator.rpcAddress);
  const delegationMode = operator.delegationMode;
  const delegationModeLabel = getDelegationModeLabel(delegationMode);

  return (
    <TableRow className="group border-border transition-colors hover:bg-[var(--bg-hover)]">
      <TableCell className="py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="h-8 w-1 shrink-0 rounded-full"
            style={getOperatorAccent(address)}
          />
          <OperatorIdenticon address={address} />
          <div className="min-w-0">
            <p className="truncate font-display font-bold text-foreground text-sm tracking-tight">
              {shortenAddress(address)}
            </p>
            <p className="mt-0.5 truncate font-mono text-muted-foreground text-xs">
              {rpcHost ?? 'No RPC advertised'}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4 font-semibold text-foreground text-sm">
        {formatStake(operator.stakingStake)}
        <span className="ml-1 text-muted-foreground text-xs">TNT</span>
      </TableCell>
      <TableCell className="py-4 font-semibold text-foreground text-sm">
        {formatCount(operator.stakingDelegationCount)}
      </TableCell>
      <TableCell className="py-4">
        <Badge
          variant={
            delegationMode === 2
              ? 'success'
              : delegationMode === 1
                ? 'outline'
                : 'secondary'
          }
        >
          {delegationModeLabel}
        </Badge>
      </TableCell>
      <TableCell className="py-4">
        <Badge
          variant={status === 'ACTIVE' ? 'success' : 'outline'}
          dot={status === 'ACTIVE'}
        >
          {formatStatus(status)}
        </Badge>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex justify-end gap-2">
          <Button
            variant="sandbox"
            size="sm"
            className="min-w-20 text-primary-foreground"
            onClick={() => onStakeClicked(address)}
          >
            Stake
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-w-20"
            onClick={() => onManageClicked(address)}
          >
            Manage
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const OperatorIdenticon = ({ address }: { address: string }) => (
  <div
    // The inline `style` from `getOperatorIdenticonStyle` paints a saturated
    // hue gradient as the actual background, so the `bg-card` fallback only
    // shows for the brief render before the style applies. `text-primary-
    // foreground` keeps the contrast stable across both themes.
    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card font-display font-extrabold text-primary-foreground text-xs shadow-[var(--shadow-card)]"
    style={getOperatorIdenticonStyle(address)}
  >
    {address.slice(2, 4).toUpperCase()}
  </div>
);

const shortenAddress = (address: string) => {
  if (address.length <= 16) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatStake = (value: bigint | null) =>
  value === null
    ? '-'
    : Number(formatUnits(value, 18)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });

const formatCount = (value: bigint | null) =>
  value === null ? '-' : value.toLocaleString();

const hashAddress = (address: string) =>
  Array.from(address).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 360;
  }, 0);

const getOperatorIdenticonStyle = (address: string) => {
  const hue = hashAddress(address);
  return {
    backgroundColor: '#111827',
    backgroundImage: `linear-gradient(135deg, hsl(${hue} 82% 40%), hsl(${(hue + 42) % 360} 82% 32%))`,
  };
};

const getOperatorAccent = (address: string): CSSProperties => {
  const hue = hashAddress(address);
  return {
    background: `linear-gradient(180deg, hsl(${hue} 82% 58%), hsl(${(hue + 42) % 360} 82% 50%))`,
  };
};

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
  if (!value) {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return value;
  }
};
