import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Card, CardVariant, Typography, Button } from '@tangle-network/ui-components';
import { ExternalLinkLine } from '@tangle-network/icons';

const SURFACE_LABELS: Record<
  NonNullable<Blueprint['blueprintUi']>['surfaces'][number],
  string
> = {
  'generic-overview': 'Overview',
  'service-explorer': 'Service explorer',
  'service-console': 'Service console',
  'actions-panel': 'Actions',
  resources: 'Resources',
  chat: 'Chat',
  vaults: 'Vaults',
  metrics: 'Metrics',
  permissions: 'Permissions',
};

type Props = {
  blueprint: Blueprint;
  serviceId?: bigint;
};

const BlueprintHostCard = ({ blueprint, serviceId }: Props) => {
  if (!blueprint.blueprintUi) {
    return null;
  }

  const { blueprintUi } = blueprint;
  const publisherLabel = blueprintUi.publisher.namespace
    ? `@${blueprintUi.publisher.namespace}`
    : blueprintUi.publisher.name;

  return (
    <Card variant={CardVariant.GLASS} className="p-6 space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Typography variant="h5" fw="bold">
            Hosted Blueprint Contract
          </Typography>
          <Typography variant="body1">
            {blueprintUi.displayName}
          </Typography>
          <Typography variant="body2" className="text-mono-100 max-w-3xl">
            {blueprintUi.description}
          </Typography>
        </div>

        {blueprintUi.externalApp && (
          <Button
            variant="secondary"
            onClick={() =>
              window.open(blueprintUi.externalApp?.url, '_blank', 'noopener,noreferrer')
            }
          >
            <span className="inline-flex items-center gap-2">
              Open Publisher App
              <ExternalLinkLine className="w-4 h-4" />
            </span>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoBlock
          label="Publisher"
          value={`${publisherLabel}${blueprintUi.publisher.verified ? ' • verified' : ''}`}
        />
        <InfoBlock
          label="Hosted Tier"
          value={
            blueprintUi.tier === 'link-out'
              ? 'Tier 2 + link-out handoff'
              : blueprintUi.tier === 'declarative'
                ? 'Tier 2 declarative host'
                : 'Tier 1 generic host'
          }
        />
        <InfoBlock
          label="Service Label"
          value={blueprintUi.resources.serviceLabel}
        />
        <InfoBlock
          label="Resource Model"
          value={`${blueprintUi.resources.itemLabel} • ${blueprintUi.resources.itemRoute}`}
        />
      </div>

      {(blueprintUi.requestedSlug || blueprintUi.canonicalSlug) && (
        <div className="space-y-1">
          <Typography variant="body2" className="text-mono-100">
            Requested host slug
          </Typography>
          <Typography variant="body1" className="font-mono">
            {blueprintUi.canonicalSlug ?? blueprintUi.requestedSlug}
          </Typography>
        </div>
      )}

      {blueprintUi.surfaces.length > 0 && (
        <div className="space-y-2">
          <Typography variant="body2" className="text-mono-100">
            Shared host surfaces
          </Typography>
          <div className="flex flex-wrap gap-2">
            {blueprintUi.surfaces.map((surface) => (
              <span
                key={surface}
                className="rounded-full border border-mono-60 dark:border-mono-140 px-3 py-1.5 text-sm"
              >
                {SURFACE_LABELS[surface]}
              </span>
            ))}
          </div>
        </div>
      )}

      {blueprintUi.externalApp && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 space-y-1">
          <Typography variant="body2" fw="semibold">
            Third-party app execution stays outside the shared cloud runtime
          </Typography>
          <Typography variant="body2" className="text-mono-100">
            Tier 3 BYOdApp embedding is not enabled here. Tangle Cloud keeps the
            shared host pages on-site and only hands off to publisher apps via a
            new tab.
            {serviceId !== undefined
              ? ` Service #${serviceId.toString()} remains manageable from the hosted protocol surfaces.`
              : ''}
          </Typography>
        </div>
      )}
    </Card>
  );
};

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <Typography variant="body2" className="text-mono-100">
      {label}
    </Typography>
    <Typography variant="body1" fw="semibold">
      {value}
    </Typography>
  </div>
);

export default BlueprintHostCard;
