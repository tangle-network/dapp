import {
  useBlueprint,
  useBlueprintDetails,
  type BlueprintOperator,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { Navigate, Link, useSearchParams } from 'react-router';
import { useCallback, useState, type FC } from 'react';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { z } from 'zod';
import BlueprintModePicker from '../../../blueprintApps/components/BlueprintModePicker';
import { useBlueprintModes } from '../../../blueprintApps/useBlueprintModes';
import BlueprintAppLandingPage from '../../../blueprintApps/components/BlueprintAppLandingPage';
import BlueprintHostCard from '../../../components/blueprintApps/BlueprintHostCard';
import { renderCuratedBlueprintLanding } from '../../../blueprintApps/modules';
import { getBlueprintAppBySlug } from '../../../blueprintApps/registry';
import { getBlueprintPath } from '../../../blueprintApps/resolver';
import { PagePath } from '../../../types';
import { useResolvedBlueprintViewFromIndexedBlueprint } from '../../../blueprintApps/useResolvedBlueprintView';
import { TangleDAppPagePath } from '../../../types';
import { BlueprintVisual } from '../../../components/blueprints/BlueprintVisual';
import { formatBlueprintName } from '../../../components/blueprints/blueprintVisualUtils';
import {
  categoryBadgeStyle,
  categoryStripeStyle,
} from '../../../components/blueprints/categoryColor';
import BlueprintVersionsPanel from '../../../components/binaryUpgrade/BlueprintVersionsPanel';
import TangleCloudCard from '../../../components/TangleCloudCard';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';

const Page: FC = () => {
  const id = useParamWithSchema('id', z.string().min(1));
  const numericId = id && /^\d+$/.test(id) ? BigInt(id) : undefined;
  const [searchParams] = useSearchParams();
  const rawRoute = searchParams.get('raw') === '1';
  const { data: blueprint, isLoading: isLoadingBlueprint } = useBlueprint(
    numericId?.toString(),
    { enabled: numericId !== undefined },
  );
  const { result: blueprintDetails, isLoading: isLoadingDetails } =
    useBlueprintDetails(numericId, {
      enabled: numericId !== undefined,
    });
  const resolvedView = useResolvedBlueprintViewFromIndexedBlueprint(blueprint);
  const entry = id ? getBlueprintAppBySlug(id) : null;
  const modes = useBlueprintModes(blueprint);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const handleModeSelect = useCallback(
    (modeId: string, blueprintId: number) => {
      setSelectedModeId(modeId);
      if (numericId !== undefined && BigInt(blueprintId) !== numericId) {
        const next = new URLSearchParams(searchParams);
        next.set('mode', modeId);
        next.set('raw', '1');
        window.history.replaceState(
          null,
          '',
          `/blueprints/${blueprintId.toString()}?${next.toString()}`,
        );
      }
    },
    [numericId, searchParams],
  );

  if (!id) return <Navigate to={PagePath.NOT_FOUND} replace />;

  if (entry) {
    const curated = renderCuratedBlueprintLanding(entry);
    if (curated) return curated;
    return <BlueprintAppLandingPage entry={entry} />;
  }

  if (numericId !== undefined) {
    if (isLoadingBlueprint || isLoadingDetails) {
      return (
        <div className="space-y-5">
          <div className="min-h-80 animate-pulse rounded-2xl bg-mono-40 dark:bg-mono-170" />
          <div className="min-h-52 animate-pulse rounded-2xl bg-mono-40 dark:bg-mono-170" />
        </div>
      );
    }

    if (!blueprint || !blueprintDetails || !resolvedView) {
      return <Navigate to={PagePath.NOT_FOUND} replace />;
    }

    if (
      !rawRoute &&
      (resolvedView.tier === 'curated-module' ||
        resolvedView.tier === 'external-app')
    ) {
      return <Navigate to={getBlueprintPath(resolvedView)} replace />;
    }

    const activeModeId =
      selectedModeId ?? searchParams.get('mode') ?? modes[0]?.id ?? null;
    const modePicker =
      modes.length > 1 ? (
        <BlueprintModePicker
          modes={modes}
          selectedModeId={activeModeId ?? modes[0].id}
          onSelect={(mode) => handleModeSelect(mode.id, mode.blueprintId)}
        />
      ) : null;

    const manifest = blueprintDetails.details.blueprintUi;
    const hasDeclarativeSurface =
      resolvedView.tier === 'declarative' &&
      manifest != null &&
      ((manifest.actions?.length ?? 0) > 0 ||
        (manifest.resourceViews?.length ?? 0) > 0 ||
        (manifest.overviewCards?.length ?? 0) > 0);

    if (hasDeclarativeSurface) {
      return (
        <div className="space-y-8">
          {modePicker}
          <BlueprintHostCard
            blueprint={blueprintDetails.details}
            operatorCount={blueprintDetails.operators.length}
            provisionPath={`/blueprints/${numericId.toString()}/deploy`}
          />
          <BlueprintVersionsPanel
            blueprintId={numericId}
            blueprintName={blueprintDetails.details.name}
          />
          <RegisteredOperatorsPanel operators={blueprintDetails.operators} />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {modePicker}
        <BlueprintDetailHero
          blueprint={blueprintDetails.details}
          operatorCount={blueprintDetails.operators.length}
          provisionPath={`/blueprints/${numericId.toString()}/deploy`}
        />
        <BlueprintVersionsPanel
          blueprintId={numericId}
          blueprintName={blueprintDetails.details.name}
        />
        <RegisteredOperatorsPanel operators={blueprintDetails.operators} />
      </div>
    );
  }

  return <Navigate to={PagePath.NOT_FOUND} replace />;
};

export default Page;

// ── Hero ─────────────────────────────────────────────────────────────────────

const BlueprintDetailHero = ({
  blueprint,
  operatorCount,
  provisionPath,
}: {
  blueprint: Blueprint;
  operatorCount: number;
  provisionPath: string;
}) => {
  const name = formatBlueprintName(blueprint.name);
  const category = blueprint.category ?? inferCategory(blueprint);
  const metadataStatus =
    blueprint.metadataVerification?.status === 'verified'
      ? 'Pinned source'
      : 'Chain-only source';
  const canCreateInstance = operatorCount > 0;
  const registerPath = `${PagePath.BLUEPRINTS}?register=${blueprint.id.toString()}`;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* Main card */}
      <TangleCloudCard
        className="overflow-hidden"
        style={categoryStripeStyle(category)}
      >
        <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
          <BlueprintVisual
            blueprint={blueprint}
            category={category}
            className="h-56 md:h-full"
          />

          <div className="flex min-w-0 flex-col">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider"
                style={categoryBadgeStyle(category)}
              >
                {category}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${operatorCount > 0 ? 'border-emerald-50/30 bg-emerald-50/10 text-emerald-50' : 'border-mono-60 dark:border-mono-170 text-mono-120 dark:text-mono-100'}`}
              >
                {operatorCount} operator{operatorCount === 1 ? '' : 's'}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${metadataStatus === 'Pinned source' ? 'border-emerald-50/30 bg-emerald-50/10 text-emerald-50' : 'border-mono-60 dark:border-mono-170 text-mono-120 dark:text-mono-100'}`}
              >
                {metadataStatus}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.05em] text-mono-200 dark:text-mono-0 md:text-5xl">
              {name}
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-3xl text-base leading-7 text-mono-140 dark:text-mono-80">
              {blueprint.description ??
                'Deploy a service instance when operators are available, or register operator capacity for this blueprint.'}
            </p>

            {/* Launch facts */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <LaunchFact
                label="Instance path"
                value={
                  canCreateInstance
                    ? 'Create a service request'
                    : 'Operator capacity required'
                }
              />
              <LaunchFact label="Payment" value="Shielded credits or token" />
              <LaunchFact label="Trust" value={metadataStatus} />
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {canCreateInstance ? (
                <Link
                  to={provisionPath}
                  className="rounded-full bg-purple-40 px-6 py-2.5 text-sm font-bold text-mono-0 transition-colors hover:bg-purple-50 dark:bg-purple-50 dark:hover:bg-purple-60"
                >
                  Create instance
                </Link>
              ) : (
                <Link
                  to={registerPath}
                  className="rounded-full bg-purple-40 px-6 py-2.5 text-sm font-bold text-mono-0 transition-colors hover:bg-purple-50 dark:bg-purple-50 dark:hover:bg-purple-60"
                >
                  Register operator capacity
                </Link>
              )}
              <Link
                to={canCreateInstance ? registerPath : provisionPath}
                className="rounded-full border border-mono-200 px-6 py-2.5 text-sm font-bold text-mono-200 transition-colors hover:border-mono-180 hover:text-mono-180 dark:border-mono-0 dark:text-mono-0 dark:hover:border-mono-20 dark:hover:text-mono-20"
              >
                {canCreateInstance ? 'Register as operator' : 'Review checkout'}
              </Link>
              {blueprint.githubUrl && (
                <a
                  href={blueprint.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-4 py-2.5 text-sm font-bold text-purple-40 transition-colors hover:text-purple-30"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </TangleCloudCard>

      {/* Side card — launch facts */}
      <TangleCloudCard className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 border-b border-mono-60 dark:border-mono-170 pb-4">
          <div>
            <Typography
              variant="h5"
              fw="bold"
              className="text-mono-200 dark:text-mono-0"
            >
              Launch facts
            </Typography>
            <p className="mt-1 text-sm text-mono-120 dark:text-mono-100">
              What matters before you create an instance.
            </p>
          </div>
          {blueprint.websiteUrl && (
            <a
              href={blueprint.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-mono-200 px-4 py-1.5 text-xs font-bold text-mono-200 dark:border-mono-0 dark:text-mono-0"
            >
              Website ↗
            </a>
          )}
        </div>

        <dl className="overflow-hidden rounded-xl border border-mono-60 dark:border-mono-170">
          {[
            [
              'Availability',
              canCreateInstance ? 'Operators online' : 'Needs operators',
            ],
            ['Payment', 'Selected at checkout'],
            ['Callers', 'Wallet-scoped by default'],
            ['Source', metadataStatus],
            ['Blueprint ID', blueprint.id.toString()],
            ['Publisher', shortenIdentity(blueprint.author)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="group flex items-center gap-3 border-b border-mono-60/50 dark:border-mono-170/50 px-3 py-2.5 transition-colors last:border-0 hover:bg-mono-20/60 dark:hover:bg-mono-190/60"
            >
              <span className="h-3 w-0.5 shrink-0 rounded-full bg-purple-40/60" />
              <dt className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-mono-120 dark:text-mono-100">
                {label}
              </dt>
              <dd className="min-w-0 grow break-words text-right font-mono text-xs text-mono-200 dark:text-mono-0">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="rounded-xl border border-purple-40/20 bg-purple-40/5 p-4">
          <Typography
            variant="body1"
            fw="bold"
            className="text-mono-200 dark:text-mono-0"
          >
            Before you commit
          </Typography>
          <ul className="mt-3 space-y-2 text-sm text-mono-140 dark:text-mono-80">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-40" />
              Operators execute the service instance.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-40" />
              Checkout shows selected operators, callers, payment, and TTL.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-40" />
              Wallet approval submits the on-chain service request.
            </li>
          </ul>
        </div>
      </TangleCloudCard>
    </section>
  );
};

const LaunchFact = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-3">
    <p className="text-[10px] font-bold uppercase tracking-wider text-mono-120 dark:text-mono-100">
      {label}
    </p>
    <p className="mt-1 text-sm text-mono-200 dark:text-mono-0">{value}</p>
  </div>
);

// ── Registered Operators Panel ───────────────────────────────────────────────

const RegisteredOperatorsPanel = ({
  operators,
}: {
  operators: BlueprintOperator[];
}) => {
  const delegatedCount = operators.filter((op) => op.isDelegated).length;
  const totalServices = operators.reduce(
    (sum, op) => sum + (op.instanceCount ?? 0),
    0,
  );

  return (
    <TangleCloudCard id="operators" className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 border-b border-mono-60 dark:border-mono-170 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-mono-60 dark:border-mono-170 px-2.5 py-0.5 text-[11px] font-semibold text-mono-120 dark:text-mono-100">
              {operators.length} indexed
            </span>
            {delegatedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-50/30 bg-emerald-50/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-50" />
                {delegatedCount} delegated
              </span>
            )}
            {operators.length > 0 && (
              <span className="text-xs text-mono-120 dark:text-mono-100">
                {totalServices} services
              </span>
            )}
          </div>
          <Typography
            variant="h4"
            fw="bold"
            className="mt-3 text-mono-200 dark:text-mono-0"
          >
            Registered operators
          </Typography>
          <p className="mt-1 text-sm text-mono-120 dark:text-mono-100">
            Operators currently registered against this blueprint.
          </p>
        </div>

        <Link
          to={TangleDAppPagePath.STAKING_DELEGATE}
          target="_blank"
          className="rounded-full border border-mono-200 px-5 py-2 text-sm font-bold text-mono-200 dark:border-mono-0 dark:text-mono-0"
        >
          Delegate stake ↗
        </Link>
      </div>

      {operators.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-3xl">⚙️</span>
          <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
            No operators yet
          </Typography>
          <Typography
            variant="body2"
            className="max-w-sm text-mono-120 dark:text-mono-100"
          >
            This blueprint has no registered operators on the selected network.
            Register operator capacity to make the blueprint deployable.
          </Typography>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-mono-60 dark:border-mono-170">
          {operators.map((operator, i) => (
            <OperatorRow
              key={operator.address}
              operator={operator}
              isLast={i === operators.length - 1}
            />
          ))}
        </div>
      )}
    </TangleCloudCard>
  );
};

const OperatorRow = ({
  operator,
  isLast,
}: {
  operator: BlueprintOperator;
  isLast: boolean;
}) => {
  const displayName =
    operator.identityName?.trim() || shortenIdentity(operator.address);
  const vaultSymbols = operator.vaultTokens.map((token) => token.symbol);

  return (
    <div
      className={`group grid gap-4 p-4 transition-colors hover:bg-mono-20/60 dark:hover:bg-mono-190/60 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center ${isLast ? '' : 'border-b border-mono-60/50 dark:border-mono-170/50'}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <OperatorIdenticon address={operator.address} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-base font-bold text-mono-200 dark:text-mono-0">
              {displayName}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${operator.isDelegated ? 'border-emerald-50/30 bg-emerald-50/10 text-emerald-50' : 'border-mono-60 dark:border-mono-170 text-mono-120 dark:text-mono-100'}`}
            >
              {operator.isDelegated ? 'Delegated' : 'Direct'}
            </span>
          </div>
          <p className="mt-1 truncate font-mono text-xs text-mono-120 dark:text-mono-100">
            {operator.address}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <RowMetric label="Services" value={operator.instanceCount} />
        <RowMetric label="Stakers" value={operator.stakersCount} />
        <RowMetric
          label="TVL"
          value={
            operator.tvlInUsd !== null
              ? `$${operator.tvlInUsd.toLocaleString()}`
              : '-'
          }
        />
      </div>

      <div className="flex flex-col items-end gap-2">
        {vaultSymbols.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-1">
            {vaultSymbols.slice(0, 3).map((symbol) => (
              <span
                key={symbol}
                className="rounded-full border border-mono-60 dark:border-mono-170 bg-mono-20 dark:bg-mono-190 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mono-200 dark:text-mono-0"
              >
                {symbol}
              </span>
            ))}
          </div>
        ) : (
          <span className="font-mono text-xs text-mono-120 dark:text-mono-100">
            No vaults
          </span>
        )}
        <Link
          to={`${TangleDAppPagePath.STAKING_DELEGATE}?operator=${operator.address}`}
          target="_blank"
          className="text-xs font-bold text-purple-40 hover:text-purple-30"
        >
          Delegate ↗
        </Link>
      </div>
    </div>
  );
};

const RowMetric = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-mono-120 dark:text-mono-100">
      {label}
    </p>
    <p className="mt-1 font-display text-base font-extrabold text-mono-200 dark:text-mono-0">
      {value}
    </p>
  </div>
);

const shortenIdentity = (value: string) => {
  if (value.length <= 18) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const OperatorIdenticon = ({ address }: { address: string }) => {
  const hue = Array.from(address).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 360;
  }, 0);

  return (
    <div
      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-sm font-extrabold text-mono-0"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 82% 58%), hsl(${(hue + 48) % 360} 82% 50%))`,
      }}
    >
      {address.slice(2, 4).toUpperCase()}
    </div>
  );
};

const inferCategory = (blueprint: Blueprint) => {
  const searchable =
    `${blueprint.name} ${blueprint.description ?? ''}`.toLowerCase();

  if (/\b(training|train|fine[- ]?tune|checkpoint)\b/.test(searchable))
    return 'AI Training';
  if (/\b(agent|sandbox|automation|bot)\b/.test(searchable)) return 'Agents';
  if (/\b(vector|embedding|rag|store|database|retrieval)\b/.test(searchable))
    return 'Data';
  if (/\b(trading|market|strategy)\b/.test(searchable)) return 'Trading';
  if (
    /\b(ai|llm|inference|model|image|video|voice|avatar|gpu)\b/.test(searchable)
  )
    return 'Inference';
  return 'Blueprint';
};
