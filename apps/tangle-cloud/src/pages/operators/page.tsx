import {
  type Operator,
  useOperators,
} from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import { Search } from '@tangle-network/icons';
import {
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
import createStakeDelegateUrl from './createStakeDelegateUrl';

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
  const totalDelegations = operatorList.reduce(
    (total, operator) => total + (operator.stakingDelegationCount ?? 0n),
    0n,
  );
  const totalStake = operatorList.reduce(
    (total, operator) => total + (operator.stakingStake ?? 0n),
    0n,
  );

  const handleStakeClicked = useCallback((operatorAddress?: Address) => {
    window.location.assign(createStakeDelegateUrl(operatorAddress));
  }, []);

  return (
    <div className="space-y-6">
      <Card
        variant="sandbox"
        className="cloud-hero-card cloud-compact-header overflow-hidden border-border bg-card shadow-[var(--shadow-card)]"
      >
        <CardContent className="relative p-4 md:p-5">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_10%_8%,rgba(99,102,241,0.16),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.12),transparent_28%)]" />

          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-foreground leading-[1.05] tracking-[-0.035em] sm:text-4xl">
                Operators
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
                Inspect registered operators, delegation mode, stake, and RPC
                availability.
              </p>
            </div>

            <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_auto] sm:items-center xl:grid-cols-1">
              <div className="grid grid-cols-3 gap-2">
                <OperatorSummaryMetric
                  label="Operators"
                  value={operatorList.length.toLocaleString()}
                />
                <OperatorSummaryMetric
                  label="Active"
                  value={activeOperatorCount.toLocaleString()}
                />
                <OperatorSummaryMetric
                  label="Delegations"
                  value={totalDelegations.toLocaleString()}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                <Button
                  variant="sandbox"
                  className="flex-1"
                  onClick={() => handleStakeClicked()}
                >
                  Delegate
                </Button>

                {isConnected && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(PagePath.OPERATORS_MANAGE)}
                  >
                    Manage operator
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 border-border border-b pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-display font-bold text-foreground text-base tracking-tight">
            Operator registry
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            Search by address, RPC endpoint, status, or delegation mode.
          </p>
        </div>

        <span className="text-muted-foreground text-sm">
          {formatStake(totalStake)} total stake
        </span>
      </div>

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
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredOperators = useMemo(() => {
    if (normalizedSearch === '') {
      return operators;
    }

    return operators.filter((operator) =>
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
  }, [normalizedSearch, operators]);

  if (isLoading) {
    return (
      <Card
        variant="sandbox"
        className="border-border bg-card shadow-[var(--shadow-card)]"
      >
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-12 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card variant="sandbox" className="border-border bg-card">
        <CardContent className="space-y-3 p-4 md:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-current text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              placeholder="Search operators"
              className="h-11 bg-background pl-10 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            />
          </div>
          <div className="text-muted-foreground text-sm">
            {filteredOperators.length} of {operators.length} operators shown
          </div>
        </CardContent>
      </Card>

      <Card variant="sandbox">
        <CardContent className="p-4 md:p-5">
          {operators.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <Badge variant="outline">Empty</Badge>
              <h3 className="mt-4 font-display font-bold text-foreground text-lg">
                No operators indexed
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Try another network or wait for the indexer to sync.
              </p>
            </div>
          ) : filteredOperators.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <Badge variant="outline">No match</Badge>
              <h3 className="mt-4 font-display font-bold text-foreground text-lg">
                No operators match this search
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Try an address fragment, RPC host, status, or public key.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-muted/20">
              {filteredOperators.map((operator) => (
                <OperatorRow
                  key={operator.id}
                  operator={operator}
                  onStakeClicked={onStakeClicked}
                  onManageClicked={onManageClicked}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const OperatorRow = ({
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
  const delegationMode = getDelegationModeLabel(operator.delegationMode);

  return (
    <div className="operator-row group relative grid gap-4 p-4 transition-colors hover:bg-muted/30 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-center">
      <div
        className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[var(--operator-accent)]"
        style={getOperatorAccent(address)}
      />

      <div className="flex min-w-0 items-center gap-4 pl-2">
        <OperatorIdenticon address={address} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-display font-bold text-foreground text-base tracking-tight">
              {shortenAddress(address)}
            </p>
            <Badge
              variant={status === 'ACTIVE' ? 'success' : 'outline'}
              dot={status === 'ACTIVE'}
              className="shrink-0"
            >
              {formatStatus(status)}
            </Badge>
          </div>
          <p className="mt-1 truncate font-mono text-muted-foreground text-xs">
            {address}
          </p>
          <p className="mt-2 truncate font-mono text-muted-foreground text-xs">
            RPC: {rpcHost ?? 'Not advertised'}
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="grid grid-cols-3 gap-2">
          <OperatorMetric
            label="Stake"
            value={formatStake(operator.stakingStake)}
          />
          <OperatorMetric
            label="Delegations"
            value={formatCount(operator.stakingDelegationCount)}
          />
          <OperatorMetric label="Mode" value={delegationMode} />
        </div>

        <div className="flex gap-2 lg:col-span-1 lg:justify-end">
          <Button
            variant="sandbox"
            size="sm"
            className="min-w-24 text-primary-foreground"
            onClick={() => onStakeClicked(address)}
          >
            Stake
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-w-24"
            onClick={() => onManageClicked(address)}
          >
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
};

const OperatorMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-border bg-card/60 p-3">
    <p className="truncate font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-1 truncate font-display font-bold text-foreground text-sm">
      {value}
    </p>
  </div>
);

const OperatorSummaryMetric = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-md border border-border bg-card/70 p-2.5">
    <p className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-0.5 font-display font-extrabold text-foreground text-base">
      {value}
    </p>
  </div>
);

const OperatorIdenticon = ({ address }: { address: string }) => (
  <div
    className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-border bg-slate-950 font-display font-extrabold text-white shadow-[var(--shadow-card)]"
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
        maximumFractionDigits: 4,
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

const getOperatorAccent = (address: string) => {
  const hue = hashAddress(address);
  return {
    '--operator-accent': `linear-gradient(90deg, hsl(${hue} 82% 58%), hsl(${(hue + 42) % 360} 82% 50%))`,
  } as CSSProperties;
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
