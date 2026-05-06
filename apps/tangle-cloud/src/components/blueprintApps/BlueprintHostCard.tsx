import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
import { ExternalLinkLine } from '@tangle-network/icons';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

const SURFACE_LABELS: Record<
  NonNullable<Blueprint['blueprintUi']>['surfaces'][number],
  string
> = {
  'generic-overview': 'Overview',
  'service-explorer': 'Running services',
  'service-console': 'Service console',
  'actions-panel': 'Request forms',
  resources: 'Runtime records',
  chat: 'Operator chat',
  vaults: 'Secrets and vaults',
  metrics: 'Metrics',
  permissions: 'Access control',
};

type BlueprintUi = NonNullable<Blueprint['blueprintUi']>;
type BlueprintUiModule = NonNullable<BlueprintUi['modules']>[number];
type BlueprintUiAction = NonNullable<BlueprintUi['actions']>[number];
type BlueprintUiActionField = NonNullable<BlueprintUiAction['fields']>[number];

type Props = {
  blueprint: Blueprint;
  serviceId?: bigint;
  provisionPath?: string;
  operatorCount?: number;
};

const BlueprintHostCard = ({
  blueprint,
  serviceId,
  provisionPath,
  operatorCount,
}: Props) => {
  if (!blueprint.blueprintUi) {
    return null;
  }

  const { blueprintUi } = blueprint;
  const accentColor = blueprintUi.theme?.accentColor ?? '#6366F1';
  const secondaryColor = blueprintUi.theme?.secondaryColor ?? '#0B1020';
  const publisherLabel = blueprintUi.publisher.namespace
    ? `@${blueprintUi.publisher.namespace}`
    : blueprintUi.publisher.name;
  const availableOperatorCount = operatorCount ?? blueprint.operatorsCount ?? 0;
  const launchLabel = blueprintUi.resources.serviceLabel;
  const trackedLabel = blueprintUi.resources.itemLabel;
  const hero = getHeroCopy(blueprintUi);
  const pageCopy = getPageCopy(blueprintUi);
  const methodCard = blueprintUi.overviewCards?.find(
    (card) => card.items && card.items.length > 0,
  );
  const statCard = blueprintUi.overviewCards?.find((card) => card.value);

  return (
    <div
      data-sandbox-ui
      className="tangle-blueprint-host space-y-6"
      style={
        {
          '--blueprint-accent': accentColor,
          '--blueprint-secondary': secondaryColor,
        } as CSSProperties
      }
    >
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#060711] shadow-[var(--shadow-card)]">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(circle at 18% 18%, ${accentColor}55, transparent 34%), radial-gradient(circle at 82% 8%, ${secondaryColor}AA, transparent 38%), linear-gradient(135deg, #080915 0%, #111827 48%, #05060D 100%)`,
          }}
        />
        <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-[var(--blueprint-accent)]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
          <div className="space-y-7">
            <div className="space-y-4">
              <h1 className="max-w-[720px] font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.04em] !text-white sm:text-5xl md:text-6xl md:leading-[0.94] md:tracking-[-0.055em] xl:text-6xl">
                {hero.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 !text-white/72">
                {hero.subtitle}
              </p>
            </div>

            <PrimaryLaunchLink label={hero.cta} provisionPath={provisionPath} />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProofPoint
                label="Capacity"
                value={
                  availableOperatorCount > 0
                    ? `${availableOperatorCount} registered`
                    : 'Select in checkout'
                }
              />
              <ProofPoint
                label="Request"
                value={
                  methodCard?.items?.slice(0, 3).join(' / ') ?? launchLabel
                }
              />
              <ProofPoint
                label="Records"
                value={statCard?.value ?? `${trackedLabel} history`}
              />
              <ProofPoint label="Checkout" value="Quote, approve, run" />
            </div>
          </div>

          <LaunchPlan
            publisherLabel={publisherLabel}
            trackedLabel={trackedLabel}
            pageCopy={pageCopy}
          />
        </div>
      </section>

      <Card
        variant="sandbox"
        className="rounded-[28px] border-white/10 bg-[var(--depth-2)]"
      >
        <CardContent className="p-6">
          <SectionHeader
            kicker={pageCopy.kicker}
            title={pageCopy.serviceTitle}
            description={pageCopy.serviceDescription}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <OutcomeCard
              title="Operator execution"
              value={`${availableOperatorCount || 0} operators`}
              description={`Operator set, request arguments, and approval terms are selected before the ${launchLabel.toLowerCase()} is created.`}
            />
            <OutcomeCard
              title={pageCopy.ledgerTitle}
              value={`${trackedLabel} ledger`}
              description={pageCopy.ledgerDescription}
            />
            <OutcomeCard
              title="Request modes"
              value={methodCard?.items?.join(' / ') ?? launchLabel}
              description="Choose the supported method, review the service order, then submit the transaction."
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card
          variant="sandbox"
          className="rounded-[28px] border-white/10 bg-[var(--depth-2)]"
        >
          <CardContent className="p-6">
            <SectionHeader
              kicker="Workflow"
              title={pageCopy.workflowTitle}
              description="Configure the request, select operators, approve the quote, and track output."
            />

            <div className="mt-6 grid gap-4">
              {(blueprintUi.actions ?? []).map((action, index) => (
                <ActionPreview
                  key={action.id}
                  action={action}
                  index={index + 1}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card
          variant="sandbox"
          className="rounded-[28px] border-white/10 bg-[var(--depth-2)]"
        >
          <CardContent className="p-6">
            <SectionHeader
              kicker="Runtime"
              title={pageCopy.runtimeTitle}
              description={`After launch, this page shows ${trackedLabel.toLowerCase()} state, operator events, and recovery artifacts.`}
            />

            <div className="mt-6 grid gap-4">
              {(blueprintUi.resourceViews ?? []).map((view) => (
                <RuntimeTable
                  key={view.id}
                  view={view}
                  trackedLabel={trackedLabel}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card
        variant="sandbox"
        className="rounded-[28px] border-white/10 bg-[var(--depth-2)]"
      >
        <CardContent className="p-6">
          <SectionHeader
            kicker="Console"
            title="Service controls"
            description="Health, metrics, permissions, events, and runtime records are attached to the service."
          />

          <div className="mt-6 flex flex-wrap gap-2">
            {(blueprintUi.modules ?? []).map((module) => (
              <Chip key={`${module.slot}-${module.module}`}>
                {module.title ?? getModuleLabel(module.module)}
              </Chip>
            ))}
            {blueprintUi.surfaces.map((surface) => (
              <Chip key={surface}>{SURFACE_LABELS[surface]}</Chip>
            ))}
          </div>

          {blueprintUi.externalApp && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-sm leading-6 !text-white/65">
                Publisher console opens in a separate tab.
                {serviceId !== undefined
                  ? ` Service #${serviceId.toString()} remains manageable here.`
                  : ''}
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold !text-white hover:!text-white/80"
                onClick={() =>
                  window.open(
                    blueprintUi.externalApp?.url,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                Publisher console
                <ExternalLinkLine className="h-4 w-4" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PrimaryLaunchLink = ({
  label,
  provisionPath,
}: {
  label: string;
  provisionPath?: string;
}) => {
  return provisionPath ? (
    <Button
      asChild
      size="xl"
      className="rounded-xl bg-[var(--blueprint-accent)] px-8 text-base font-bold !text-white shadow-lg shadow-black/25 hover:brightness-110"
    >
      <Link to={provisionPath}>{label}</Link>
    </Button>
  ) : (
    <Button
      type="button"
      size="xl"
      className="rounded-xl bg-[var(--blueprint-accent)] px-8 text-base font-bold !text-white shadow-lg shadow-black/25 hover:brightness-110"
    >
      {label}
    </Button>
  );
};

const LaunchPlan = ({
  publisherLabel,
  trackedLabel,
  pageCopy,
}: {
  publisherLabel: string;
  trackedLabel: string;
  pageCopy: BlueprintPageCopy;
}) => (
  <aside className="relative overflow-hidden rounded-[28px] border border-white/12 bg-black/30 p-5 shadow-2xl shadow-black/30 backdrop-blur">
    <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    <p className="font-bold text-[10px] uppercase tracking-[0.2em] !text-white/45">
      Launch plan
    </p>
    <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight !text-white">
      {pageCopy.planTitle}
    </h2>

    <div className="mt-5 grid gap-3">
      <PlanStep index="1" title={pageCopy.planStepOne} />
      <PlanStep index="2" title="Select the operator set" />
      <PlanStep index="3" title="Review price and approve from wallet" />
      <PlanStep
        index="4"
        title={`Monitor ${trackedLabel.toLowerCase()} output`}
      />
    </div>

    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <p className="font-bold text-[10px] uppercase tracking-[0.18em] !text-white/42">
        Publisher
      </p>
      <p className="mt-2 font-display text-xl font-extrabold !text-white">
        {publisherLabel}
      </p>
    </div>
  </aside>
);

const ProofPoint = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
    <p className="font-bold text-[10px] uppercase tracking-[0.18em] !text-white/42">
      {label}
    </p>
    <p className="mt-2 font-display text-lg font-extrabold tracking-tight !text-white">
      {value}
    </p>
  </div>
);

const PlanStep = ({ index, title }: { index: string; title: string }) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--blueprint-accent)] font-display text-sm font-extrabold !text-white">
      {index}
    </span>
    <p className="text-sm font-semibold leading-5 !text-white/78">{title}</p>
  </div>
);

const SectionHeader = ({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) => (
  <div>
    <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-[var(--surface-success-text)]">
      {kicker}
    </p>
    <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight !text-white">
      {title}
    </h2>
    <p className="mt-3 max-w-2xl text-sm leading-6 !text-white/62">
      {description}
    </p>
  </div>
);

const OutcomeCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
    <p className="font-bold text-[10px] uppercase tracking-[0.18em] !text-white/42">
      {title}
    </p>
    <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight !text-white">
      {value}
    </h3>
    <p className="mt-3 text-sm leading-6 !text-white/62">{description}</p>
  </div>
);

const ActionPreview = ({
  action,
  index,
  accentColor,
}: {
  action: BlueprintUiAction;
  index: number;
  accentColor: string;
}) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
    <div className="flex gap-4">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-sm font-extrabold !text-white"
        style={{ backgroundColor: accentColor }}
      >
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold !text-white">
          {action.label}
        </h3>
        {action.description && (
          <p className="mt-2 text-sm leading-6 !text-white/62">
            {action.description}
          </p>
        )}
        {action.fields && action.fields.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {action.fields.slice(0, 5).map((field) => (
              <FieldChip key={field.key} field={field} />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const FieldChip = ({ field }: { field: BlueprintUiActionField }) => (
  <Badge
    variant="sandbox"
    className="border-white/10 bg-white/[0.04] !text-white/72"
  >
    {field.label}
    {field.required ? ' *' : ''}
  </Badge>
);

const RuntimeTable = ({
  view,
  trackedLabel,
}: {
  view: NonNullable<BlueprintUi['resourceViews']>[number];
  trackedLabel: string;
}) => (
  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.035]">
    <div className="flex items-center justify-between border-white/10 border-b p-4">
      <h3 className="font-display text-lg font-bold !text-white">
        {view.title}
      </h3>
      <Badge className="bg-[var(--surface-success-bg)] text-[var(--surface-success-text)]">
        Live after launch
      </Badge>
    </div>
    <div
      className="grid bg-white/[0.035]"
      style={{
        gridTemplateColumns: `repeat(${view.columns.length}, minmax(9rem, 1fr))`,
      }}
    >
      {view.columns.map((column) => (
        <div
          key={column.key}
          className="border-white/8 border-r px-4 py-3 text-xs font-bold uppercase tracking-widest !text-white/45 last:border-r-0"
        >
          {column.label}
        </div>
      ))}
    </div>
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${view.columns.length}, minmax(9rem, 1fr))`,
      }}
    >
      {view.columns.map((column) => (
        <div
          key={column.key}
          className="border-white/8 border-r px-4 py-4 text-sm font-semibold !text-white/72 last:border-r-0"
        >
          {column.emphasis ? trackedLabel : 'Pending'}
        </div>
      ))}
    </div>
  </div>
);

const Chip = ({ children }: { children: string }) => (
  <Badge
    variant="sandbox"
    className="border-white/10 bg-white/[0.035] !text-white/72"
  >
    {children}
  </Badge>
);

const getHeroCopy = (blueprintUi: BlueprintUi) => {
  const name = blueprintUi.displayName.toLowerCase();
  const service = blueprintUi.resources.serviceLabel.toLowerCase();

  if (name.includes('training') || service.includes('training')) {
    return {
      title: 'Train an LLM across a distributed operator network.',
      subtitle:
        'Create a training service, select operators, set the method, and track checkpoint records from the service page.',
      cta: 'Configure run',
    };
  }

  if (name.includes('inference') || service.includes('inference')) {
    return {
      title: 'Create an inference service.',
      subtitle:
        'Select operators, configure request limits, approve the quote, and monitor request records.',
      cta: `Configure ${blueprintUi.resources.serviceLabel}`,
    };
  }

  return {
    title: `Create ${blueprintUi.displayName}.`,
    subtitle:
      blueprintUi.description ||
      'Create a service instance, select operators, approve the quote, and monitor runtime state.',
    cta: `Configure ${blueprintUi.resources.serviceLabel}`,
  };
};

type BlueprintPageCopy = {
  kicker: string;
  serviceTitle: string;
  serviceDescription: string;
  ledgerTitle: string;
  ledgerDescription: string;
  workflowTitle: string;
  runtimeTitle: string;
  planTitle: string;
  planStepOne: string;
};

const getPageCopy = (blueprintUi: BlueprintUi): BlueprintPageCopy => {
  const name = blueprintUi.displayName.toLowerCase();
  const service = blueprintUi.resources.serviceLabel;
  const item = blueprintUi.resources.itemLabel;

  if (name.includes('training') || service.toLowerCase().includes('training')) {
    return {
      kicker: 'Training',
      serviceTitle: 'Configure the training run',
      serviceDescription:
        'Set the method, select operators, approve the quote, and track checkpoints.',
      ledgerTitle: 'Checkpoint ledger',
      ledgerDescription:
        'Checkpoint URI, hash, participant state, and verification output become part of the live run history.',
      workflowTitle: 'Request, approval, checkpoints',
      runtimeTitle: 'Epochs, operators, checkpoints, verification',
      planTitle: 'Configure, approve, monitor.',
      planStepOne: 'Choose model, method, and epochs',
    };
  }

  if (name.includes('trading') || service.toLowerCase().includes('trading')) {
    return {
      kicker: 'Trading',
      serviceTitle: 'Configure the trading service',
      serviceDescription:
        'Set the strategy, select operators, approve the quote, and track execution.',
      ledgerTitle: 'Execution ledger',
      ledgerDescription:
        'Strategy, validator state, vault bindings, and execution records stay attached to the service history.',
      workflowTitle: 'Strategy, approval, execution',
      runtimeTitle: 'Bots, strategies, validator state, vaults',
      planTitle: 'Configure, approve, monitor.',
      planStepOne: 'Choose strategy, limits, and runtime settings',
    };
  }

  if (
    name.includes('inference') ||
    service.toLowerCase().includes('inference')
  ) {
    return {
      kicker: 'Inference',
      serviceTitle: 'Configure the inference service',
      serviceDescription:
        'Set request parameters, select operators, approve the quote, and track output.',
      ledgerTitle: `${item} ledger`,
      ledgerDescription:
        'Requests, operator responses, usage records, and verification state stay attached to the service history.',
      workflowTitle: 'Request, approval, output',
      runtimeTitle: `${item}s, operators, usage, verification`,
      planTitle: 'Configure, approve, monitor.',
      planStepOne: 'Choose model, request mode, and limits',
    };
  }

  return {
    kicker: 'Service',
    serviceTitle: `Configure the ${service.toLowerCase()}`,
    serviceDescription:
      'Set request parameters, select operators, approve the quote, and track output.',
    ledgerTitle: `${item} ledger`,
    ledgerDescription:
      'Runtime records, operator state, and verification output stay attached to the service history.',
    workflowTitle: 'Request, approval, output',
    runtimeTitle: `${item}s, operators, state, verification`,
    planTitle: 'Configure, approve, monitor.',
    planStepOne: 'Choose request parameters',
  };
};

const MODULE_LABELS: Record<BlueprintUiModule['module'], string> = {
  'metrics-overview': 'Metrics overview',
  'service-health': 'Service health',
  'resource-events': 'Resource events',
  'permissions-matrix': 'Permissions',
  'activity-feed': 'Activity feed',
};

const getModuleLabel = (module: BlueprintUiModule['module']) =>
  MODULE_LABELS[module] ?? module;

export default BlueprintHostCard;
