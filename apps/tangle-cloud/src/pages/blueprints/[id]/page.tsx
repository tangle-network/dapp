import {
  useBlueprint,
  useBlueprintDetails,
  type BlueprintOperator,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import { Navigate, Link } from 'react-router';
import type { FC } from 'react';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { z } from 'zod';
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

const Page: FC = () => {
  const id = useParamWithSchema('id', z.string().min(1));
  const numericId = id && /^\d+$/.test(id) ? BigInt(id) : undefined;
  const { data: blueprint, isLoading: isLoadingBlueprint } = useBlueprint(
    numericId?.toString(),
    {
      enabled: numericId !== undefined,
    },
  );
  const { result: blueprintDetails, isLoading: isLoadingDetails } =
    useBlueprintDetails(numericId, {
      enabled: numericId !== undefined,
    });
  const resolvedView = useResolvedBlueprintViewFromIndexedBlueprint(blueprint);
  const entry = id ? getBlueprintAppBySlug(id) : null;

  if (!id) {
    return <Navigate to={PagePath.NOT_FOUND} replace />;
  }

  if (entry) {
    const curated = renderCuratedBlueprintLanding(entry);
    if (curated) {
      return curated;
    }
    return <BlueprintAppLandingPage entry={entry} />;
  }

  if (numericId !== undefined) {
    if (isLoadingBlueprint || isLoadingDetails) {
      return (
        <div className="space-y-5">
          <Skeleton className="min-h-80 rounded-lg" />
          <Skeleton className="min-h-52 rounded-lg" />
        </div>
      );
    }

    if (!blueprint || !blueprintDetails || !resolvedView) {
      return <Navigate to={PagePath.NOT_FOUND} replace />;
    }

    if (
      resolvedView.tier === 'curated-module' ||
      resolvedView.tier === 'external-app'
    ) {
      return <Navigate to={getBlueprintPath(resolvedView)} replace />;
    }

    // Declarative tier: render the per-app surface manifest (theme, overview
    // cards, actions, resource views, modules) instead of the protocol-generic
    // hero. Falls back to BlueprintDetailHero whenever the manifest is absent
    // or shallow (no actions and no resourceViews populated).
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
          <BlueprintHostCard
            blueprint={blueprintDetails.details}
            operatorCount={blueprintDetails.operators.length}
            provisionPath={`/blueprints/${numericId.toString()}/deploy`}
          />

          <RegisteredOperatorsPanel operators={blueprintDetails.operators} />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <BlueprintDetailHero
          blueprint={blueprintDetails.details}
          operatorCount={blueprintDetails.operators.length}
          provisionPath={`/blueprints/${numericId.toString()}/deploy`}
        />

        <RegisteredOperatorsPanel operators={blueprintDetails.operators} />
      </div>
    );
  }

  return <Navigate to={PagePath.NOT_FOUND} replace />;
};

export default Page;

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
  const metadataItems = [
    [
      'Availability',
      canCreateInstance ? 'Operators online' : 'Needs operators',
    ],
    ['Payment', 'Selected at checkout'],
    ['Callers', 'Wallet-scoped by default'],
    ['Source', metadataStatus],
    ['Blueprint ID', blueprint.id.toString()],
    ['Publisher', shortenIdentity(blueprint.author)],
  ];

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card
        variant="sandbox"
        className="overflow-hidden border-border bg-card shadow-[var(--shadow-card)]"
      >
        <CardContent className="grid gap-6 p-5 md:grid-cols-[300px_minmax(0,1fr)] md:p-6">
          <BlueprintVisual
            blueprint={blueprint}
            category={category}
            className="h-64 md:h-full"
          />

          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{category}</Badge>
              <Badge variant={operatorCount > 0 ? 'success' : 'outline'} dot>
                {operatorCount} operator{operatorCount === 1 ? '' : 's'}
              </Badge>
              <Badge
                variant={
                  metadataStatus === 'Pinned source' ? 'success' : 'outline'
                }
              >
                {metadataStatus}
              </Badge>
            </div>

            <h1 className="mt-5 max-w-3xl font-display font-extrabold text-4xl text-foreground leading-[0.95] tracking-[-0.05em] md:text-6xl">
              {name}
            </h1>
            <p className="mt-5 max-w-3xl text-muted-foreground text-base leading-7">
              {blueprint.description ??
                'Deploy a service instance when operators are available, or register operator capacity for this blueprint.'}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <LaunchFact
                label="Instance path"
                value={
                  canCreateInstance
                    ? 'Create a service request'
                    : 'Operator capacity required'
                }
              />
              <LaunchFact
                label="Payment"
                value="Shielded credits or token payment"
              />
              <LaunchFact label="Trust" value={metadataStatus} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {canCreateInstance ? (
                <Button variant="sandbox" size="lg" asChild>
                  <Link to={provisionPath}>Create instance</Link>
                </Button>
              ) : (
                <Button variant="sandbox" size="lg" asChild>
                  <Link to={registerPath}>Register operator capacity</Link>
                </Button>
              )}
              <Button variant="outline" size="lg" asChild>
                <Link to={canCreateInstance ? registerPath : provisionPath}>
                  {canCreateInstance
                    ? 'Register as operator'
                    : 'Review checkout'}
                </Link>
              </Button>
              {blueprint.githubUrl && (
                <Button variant="ghost" size="lg" asChild>
                  <a
                    href={blueprint.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="sandbox" className="border-border bg-card">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 border-border border-b pb-4">
            <div>
              <h2 className="font-display font-extrabold text-foreground text-xl">
                Launch facts
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">
                What matters before you create an instance or register capacity.
              </p>
            </div>
            {blueprint.websiteUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={blueprint.websiteUrl} target="_blank" rel="noreferrer">
                  Website
                </a>
              </Button>
            )}
          </div>

          <dl className="mt-5 space-y-3">
            {metadataItems.map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <dt className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                  {label}
                </dt>
                <dd className="mt-1 break-all font-mono text-foreground text-xs">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 rounded-lg border border-border bg-muted/20 p-4">
            <h3 className="font-display font-bold text-foreground text-base">
              Before you commit
            </h3>
            <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
              <li>Operators execute the service instance.</li>
              <li>
                Checkout shows selected operators, callers, payment, and TTL.
              </li>
              <li>Wallet approval submits the on-chain service request.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

const LaunchFact = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-muted/25 p-3">
    <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-1 text-foreground text-sm">{value}</p>
  </div>
);

const RegisteredOperatorsPanel = ({
  operators,
}: {
  operators: BlueprintOperator[];
}) => {
  return (
    <Card
      id="operators"
      variant="sandbox"
      className="border-border bg-card shadow-[var(--shadow-card)]"
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-3 border-border border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="outline">{operators.length} indexed</Badge>
            <h2 className="mt-3 font-display font-extrabold text-foreground text-2xl tracking-tight">
              Registered operators
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Operators currently registered against this blueprint.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link to={TangleDAppPagePath.STAKING_DELEGATE} target="_blank">
              Delegate stake
            </Link>
          </Button>
        </div>

        {operators.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="max-w-md text-muted-foreground text-sm">
              No operators are indexed for this blueprint on the selected
              network yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-muted/20">
            {operators.map((operator) => (
              <OperatorCard key={operator.address} operator={operator} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const OperatorCard = ({ operator }: { operator: BlueprintOperator }) => {
  const displayName =
    operator.identityName?.trim() || shortenIdentity(operator.address);
  const vaultSummary =
    operator.vaultTokens.length > 0
      ? operator.vaultTokens.map((token) => token.symbol).join(', ')
      : 'No vaults indexed';

  return (
    <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_360px] md:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <OperatorIdenticon address={operator.address} />
        <div className="min-w-0">
          <h3 className="truncate font-display font-bold text-foreground text-lg">
            {displayName}
          </h3>
          <p className="mt-1 truncate font-mono text-muted-foreground text-xs">
            {operator.address}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <OperatorMetric label="Services" value={operator.instanceCount} />
        <OperatorMetric label="Stakers" value={operator.stakersCount} />
        <OperatorMetric
          label="TVL"
          value={
            operator.tvlInUsd !== null
              ? `$${operator.tvlInUsd.toLocaleString()}`
              : '-'
          }
        />
      </div>

      <div className="flex items-center justify-between gap-3 md:col-span-2">
        <p className="line-clamp-1 text-muted-foreground text-xs">
          {vaultSummary}
        </p>
        <Badge variant={operator.isDelegated ? 'success' : 'outline'} dot>
          {operator.isDelegated ? 'Delegated' : 'Direct'}
        </Badge>
      </div>
    </div>
  );
};

const OperatorMetric = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div>
    <p className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-1 font-display font-extrabold text-foreground text-base">
      {value}
    </p>
  </div>
);

const shortenIdentity = (value: string) => {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const OperatorIdenticon = ({ address }: { address: string }) => {
  const hue = Array.from(address).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 360;
  }, 0);

  return (
    <div
      className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-border font-display font-extrabold text-white"
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

  if (/\b(training|train|fine[- ]?tune|checkpoint)\b/.test(searchable)) {
    return 'AI Training';
  }

  if (/\b(agent|sandbox|automation|bot)\b/.test(searchable)) {
    return 'Agents';
  }

  if (/\b(vector|embedding|rag|store|database|retrieval)\b/.test(searchable)) {
    return 'Data';
  }

  if (/\b(trading|market|strategy)\b/.test(searchable)) {
    return 'Trading';
  }

  if (
    /\b(ai|llm|inference|model|image|video|voice|avatar|gpu)\b/.test(searchable)
  ) {
    return 'Inference';
  }

  return 'Blueprint';
};
