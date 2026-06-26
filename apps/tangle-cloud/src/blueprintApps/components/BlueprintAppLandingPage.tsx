import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
import { useMemo, useState, type FC, type ReactNode } from 'react';
import { Link } from 'react-router';
import { resolveBlueprintAppView } from '../resolver';
import type { BlueprintAppEntry } from '../types';
import type { TangleBlueprintAppEntry } from '../manifest';
import type { BlueprintIframeConfig } from '../iframe/types';
import BlueprintModePicker from './BlueprintModePicker';
import IframeBlueprintLayout from './IframeBlueprintLayout';
import { useBlueprint } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useBlueprintModes } from '../useBlueprintModes';
import type {
  BlueprintUiAction,
  BlueprintUiCardTone,
  BlueprintUiOverviewCard,
  BlueprintUiTheme,
} from '@tangle-network/tangle-shared-ui/blueprintApps/types';

type Props = {
  entry: BlueprintAppEntry | TangleBlueprintAppEntry;
};

// CSS custom properties published on the hero wrapper from `manifest.theme`.
// Subtle, deliberate use only — the accent tints the hero glow + a single
// divider so the publisher's brand color shows without taking over the rest
// of the surface, which still uses cloud-app tokens for legibility.
const themeStyle = (
  theme: BlueprintUiTheme | undefined,
): React.CSSProperties => {
  if (!theme) return {};
  const out: Record<string, string> = {};
  if (theme.accentColor) out['--blueprint-accent'] = theme.accentColor;
  if (theme.secondaryColor)
    out['--blueprint-accent-secondary'] = theme.secondaryColor;
  return out as React.CSSProperties;
};

const BlueprintAppLandingPage: FC<Props> = ({ entry }) => {
  const view = resolveBlueprintAppView(entry);
  // Iframe is rendered when the entry carries a parsed iframe policy AND its
  // manifest declares the externalApp as a trusted iframe handoff. Both the
  // metadata-driven path (`buildBlueprintManifestFromMetadata`) and the
  // curated-registry path (registry.ts) populate these in tandem so the
  // landing page never has to know which path produced the entry.
  const entryIframe = (entry as { iframe?: BlueprintIframeConfig }).iframe;
  const iframeConfig =
    entryIframe !== undefined &&
    view.manifest.externalApp?.mode === 'iframe' &&
    view.manifest.externalApp?.trust === 'trusted'
      ? entryIframe
      : undefined;
  // For curated entries we still need a blueprint object to ask the
  // modes hook for siblings — the entry only carries the canonical id.
  const { data: canonicalBlueprint } = useBlueprint(
    view.blueprintId?.toString(),
    { enabled: view.blueprintId !== undefined },
  );
  const modes = useBlueprintModes(canonicalBlueprint);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const activeMode = useMemo(() => {
    if (modes.length === 0) return null;
    const fromState = modes.find((m) => m.id === selectedModeId);
    return fromState ?? modes[0];
  }, [modes, selectedModeId]);
  const provisionPath =
    activeMode !== null
      ? `/blueprints/${activeMode.blueprintId.toString()}/deploy`
      : view.blueprintId !== undefined
        ? `/blueprints/${view.blueprintId.toString()}/deploy`
        : '/blueprints/create';
  const serviceNoun = view.manifest.resources.serviceNoun;
  const resourceNoun = view.manifest.resources.resourceNoun;

  // Publisher-declared metadata drives the procedural surfaces below.
  // `BlueprintUiManifest` (the resolved-view manifest) is intentionally
  // narrow — overviewCards / actions / theme live on the richer on-chain
  // `BlueprintUiContract` schema, which we read off the canonical blueprint
  // directly. Each renderer falls back to a sensible default when its field
  // is absent so blueprints with no opinion still get a polished landing.
  const blueprintUi = canonicalBlueprint?.blueprintUi ?? null;
  const overviewCards = useMemo(
    () => blueprintUi?.overviewCards ?? [],
    [blueprintUi?.overviewCards],
  );
  const actions = useMemo(
    () => blueprintUi?.actions ?? [],
    [blueprintUi?.actions],
  );
  const theme = blueprintUi?.theme;

  // Right-hand "checkout path" panel — defaults to a three-step affordance
  // built from the resources nouns. When the publisher declares `actions[]`,
  // each action becomes a step (label → optional description). Cap at 5 to
  // keep the column scannable; overflow lives on the deploy page.
  const checkoutSteps: { title: string; description?: string }[] =
    actions.length > 0
      ? actions.slice(0, 5).map((a: BlueprintUiAction) => ({
          title: a.label,
          description: a.description,
        }))
      : [
          { title: `Configure the ${serviceNoun}` },
          { title: 'Choose registered operators' },
          { title: `Track ${resourceNoun} output` },
        ];

  // Iframe-mode blueprints get the iframe-first layout — the publisher's
  // hosted app fills the viewport, our chrome is a 52px strip with the
  // Create-instance CTA and a Details disclosure. Non-iframe blueprints fall
  // through to the procedural layout below, which IS the page surface and
  // earns the full hero + checkout-path + overview-cards + actions stack.
  if (iframeConfig) {
    return (
      <IframeBlueprintLayout
        iframeConfig={iframeConfig}
        displayName={view.manifest.displayName}
        tagline={view.manifest.tagline}
        description={view.manifest.description}
        serviceNoun={serviceNoun}
        provisionPath={provisionPath}
        websiteUrl={canonicalBlueprint?.website}
        protocolDetailHref={
          activeMode?.blueprintId !== undefined
            ? `/blueprints/${activeMode.blueprintId.toString()}?raw=1`
            : view.blueprintId !== undefined
              ? `/blueprints/${view.blueprintId.toString()}?raw=1`
              : undefined
        }
        externalAppUrl={view.manifest.externalApp?.url}
        modes={modes}
        activeMode={activeMode}
        onSelectMode={setSelectedModeId}
        blueprintId={view.blueprintId}
        overviewCards={overviewCards}
        actions={actions}
        theme={theme}
      />
    );
  }

  return (
    // The shell `<div>` rendered by Layout already declares
    // `data-sandbox-ui` + `data-sandbox-theme`, and the sandbox-ui CSS resets
    // every token via `:root, [data-sandbox-ui]`. Re-declaring `data-sandbox-ui`
    // on an inner wrapper would re-apply those defaults under the inner element
    // and break theme inheritance (e.g. vault `--hsl-card` snapping back to the
    // dark default). Inner wrappers must NOT carry `data-sandbox-ui`.
    <div className="space-y-6" style={themeStyle(theme)}>
      <Card variant="sandbox" className="overflow-hidden rounded-[32px]">
        <CardContent className="relative p-6 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--blueprint-accent,var(--border-accent-hover))] to-transparent" />
          <div
            className="absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl opacity-20"
            style={{
              background:
                'var(--blueprint-accent, var(--brand-purple, #6366f1))',
            }}
          />

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-3xl space-y-4">
              <div className="space-y-2">
                <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-mono-200 dark:text-mono-0 md:text-5xl">
                  {view.manifest.displayName}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-mono-100 dark:text-mono-80">
                  {view.manifest.tagline}
                </p>
              </div>

              <p className="max-w-3xl text-base leading-7 text-mono-200 dark:text-mono-0/90">
                {view.manifest.description}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg">
                  <Link to={provisionPath}>Create {serviceNoun}</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/blueprints">Browse blueprints</Link>
                </Button>
                {view.manifest.externalApp?.trust === 'trusted' &&
                  // When we're already embedding the publisher's iframe inline
                  // below, the "open in new tab" button duplicates the same
                  // destination and confuses operators. Only show it for the
                  // link-only handoff path.
                  !iframeConfig && (
                    <Button asChild variant="secondary" size="lg">
                      <a
                        href={view.manifest.externalApp.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {view.manifest.externalApp.label ?? 'Publisher console'}
                      </a>
                    </Button>
                  )}
                {(activeMode || view.blueprintId !== undefined) && (
                  // Power-user escape hatch: jump to the protocol-generic
                  // per-id detail page for the picked mode (or canonical
                  // blueprint when no mode is picked). `?raw=1` suppresses
                  // the curated-tier redirect on that route.
                  <Button asChild variant="ghost" size="lg">
                    <Link
                      to={`/blueprints/${(activeMode?.blueprintId ?? view.blueprintId)?.toString()}?raw=1`}
                    >
                      View on-chain
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-mono-60 dark:border-mono-170 bg-[color:var(--bg-elevated)] p-5">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-mono-200 dark:text-mono-0">
                Checkout path
              </h2>
              <div className="grid gap-3">
                {checkoutSteps.map((step, i) => (
                  <Step
                    key={i}
                    index={String(i + 1)}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {modes.length > 1 && activeMode && (
        <BlueprintModePicker
          modes={modes}
          selectedModeId={activeMode.id}
          onSelect={(mode) => setSelectedModeId(mode.id)}
        />
      )}

      {/* Iframe rendering for iframe-mode blueprints happens in the
       * IframeBlueprintLayout branch above. This procedural layout is for
       * non-iframe blueprints — overview/actions/metric grid surface the
       * blueprint's identity directly, since there's no publisher app to
       * defer to. */}

      <OverviewCardGrid
        cards={overviewCards}
        fallbackServiceNoun={serviceNoun}
        fallbackResourceNoun={resourceNoun}
      />

      <ActionLauncher
        actions={actions}
        provisionPath={provisionPath}
        serviceNoun={serviceNoun}
      />
    </div>
  );
};

/**
 * Checkout-path step. `description` is optional — declared actions can carry
 * a one-liner explainer, the default-three steps don't bother.
 */
const Step = ({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description?: string;
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-mono-60 dark:border-mono-170 bg-[color:var(--bg-mono-0 dark:bg-mono-180)] p-3">
    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-40 text-xs font-bold text-purple-40-foreground">
      {index}
    </span>
    <div className="space-y-0.5">
      <p className="text-sm font-semibold text-mono-200 dark:text-mono-0">
        {title}
      </p>
      {description && (
        <p className="text-xs leading-5 text-mono-100 dark:text-mono-80">
          {description}
        </p>
      )}
    </div>
  </div>
);

const TONE_BADGE: Record<BlueprintUiCardTone, string> = {
  neutral:
    'border-mono-60 dark:border-mono-170 text-mono-100 dark:text-mono-80',
  info: 'border-[color:var(--border-accent)] text-mono-200 dark:text-mono-0',
  success:
    'border-[color:var(--md3-tertiary,#10B981)]/40 text-[color:var(--md3-tertiary,#10B981)]',
  warning:
    'border-[color:var(--md3-error,#ff5277)]/40 text-[color:var(--md3-error,#ff5277)]',
};

/**
 * Render the publisher's overviewCards[] when present. Each card is one of
 * four kinds: stat (big value), callout (toned panel), links (curated list),
 * checklist (bulleted items).
 *
 * Falls back to a generic three-card "what is this blueprint" intro when the
 * manifest doesn't declare any. The fallback intentionally describes the
 * Tangle architecture, not the blueprint — so it stays useful for any
 * unfamiliar blueprint without misleading copy.
 */
const OverviewCardGrid = ({
  cards,
  fallbackServiceNoun,
  fallbackResourceNoun,
}: {
  cards: BlueprintUiOverviewCard[];
  fallbackServiceNoun: string;
  fallbackResourceNoun: string;
}) => {
  if (cards.length === 0) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard
          badge="Cloud service"
          description={`Create a ${fallbackServiceNoun}, choose operators, and submit the service order.`}
        />
        <SummaryCard
          badge="Runtime visibility"
          description={`Monitor ${fallbackResourceNoun} records, events, and operator output from the same page.`}
        />
        <SummaryCard
          badge="Safe checkout"
          description="Approve service requests from your wallet without embedding third-party code in the flow."
        />
      </div>
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <OverviewCard key={card.id} card={card} />
      ))}
    </div>
  );
};

const OverviewCard = ({ card }: { card: BlueprintUiOverviewCard }) => {
  const tone = card.tone ?? 'neutral';
  switch (card.kind) {
    case 'stat':
      return (
        <Card variant="sandbox" className="rounded-3xl">
          <CardContent className="space-y-3 p-6">
            <Badge variant="sandbox" className={`w-fit ${TONE_BADGE[tone]}`}>
              {card.title}
            </Badge>
            {card.value && (
              <p className="font-display text-3xl font-extrabold leading-none tracking-tight text-mono-200 dark:text-mono-0">
                {card.value}
              </p>
            )}
            {card.description && (
              <p className="text-sm leading-6 text-mono-100 dark:text-mono-80">
                {card.description}
              </p>
            )}
          </CardContent>
        </Card>
      );
    case 'links':
      return (
        <Card variant="sandbox" className="rounded-3xl">
          <CardContent className="space-y-3 p-6">
            <Badge variant="sandbox" className={`w-fit ${TONE_BADGE[tone]}`}>
              {card.title}
            </Badge>
            {card.description && (
              <p className="text-sm leading-6 text-mono-100 dark:text-mono-80">
                {card.description}
              </p>
            )}
            {card.links && card.links.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {card.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-purple-40 hover:underline"
                    >
                      {l.label}
                      <span aria-hidden>→</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      );
    case 'checklist':
      return (
        <Card variant="sandbox" className="rounded-3xl">
          <CardContent className="space-y-3 p-6">
            <Badge variant="sandbox" className={`w-fit ${TONE_BADGE[tone]}`}>
              {card.title}
            </Badge>
            {card.description && (
              <p className="text-sm leading-6 text-mono-100 dark:text-mono-80">
                {card.description}
              </p>
            )}
            {card.items && card.items.length > 0 && (
              <ul className="space-y-1.5 pt-1 text-sm leading-6 text-mono-200 dark:text-mono-0/90">
                {card.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-40" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      );
    case 'callout':
    default:
      return (
        <Card variant="sandbox" className="rounded-3xl">
          <CardContent className="space-y-3 p-6">
            <Badge variant="sandbox" className={`w-fit ${TONE_BADGE[tone]}`}>
              {card.title}
            </Badge>
            {card.description && (
              <p className="text-sm leading-6 text-mono-100 dark:text-mono-80">
                {card.description}
              </p>
            )}
          </CardContent>
        </Card>
      );
  }
};

const SummaryCard = ({
  badge,
  description,
}: {
  badge: string;
  description: ReactNode;
}) => (
  <Card variant="sandbox" className="rounded-3xl">
    <CardContent className="space-y-3 p-6">
      <Badge variant="sandbox" className="w-fit">
        {badge}
      </Badge>
      <p className="text-sm leading-6 text-mono-100 dark:text-mono-80">
        {description}
      </p>
    </CardContent>
  </Card>
);

/**
 * When the publisher declares `actions[]`, surface a launcher row that lets
 * the operator jump straight to specific entrypoints (Configure / Deploy /
 * Track / etc.) rather than scrolling back up to the hero CTAs. Each action
 * routes to the deploy page with `?action=<id>` so the wizard can dispatch.
 * Actions with an external `href` get a link-out treatment instead.
 */
const ActionLauncher = ({
  actions,
  provisionPath,
  serviceNoun,
}: {
  actions: BlueprintUiAction[];
  provisionPath: string;
  serviceNoun: string;
}) => {
  if (actions.length === 0) return null;
  return (
    <Card variant="sandbox" className="rounded-3xl">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-mono-200 dark:text-mono-0">
            What you can do
          </h2>
          <p className="text-xs uppercase tracking-wider text-mono-100 dark:text-mono-80">
            {actions.length} action{actions.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              provisionPath={provisionPath}
              serviceNoun={serviceNoun}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ActionCard = ({
  action,
  provisionPath,
  serviceNoun,
}: {
  action: BlueprintUiAction;
  provisionPath: string;
  serviceNoun: string;
}) => {
  const submitLabel = action.submitLabel ?? action.label;
  const body = (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-mono-60 dark:border-mono-170 bg-[color:var(--bg-mono-0 dark:bg-mono-180)] p-4 transition-colors hover:border-[color:var(--border-hover)] hover:bg-[color:var(--bg-hover)]">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-mono-200 dark:text-mono-0">
          {action.label}
        </p>
        {action.description && (
          <p className="text-xs leading-5 text-mono-100 dark:text-mono-80">
            {action.description}
          </p>
        )}
      </div>
      <span className="shrink-0 text-xs font-semibold text-purple-40">
        {submitLabel} →
      </span>
    </div>
  );
  if (action.href) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${action.label} — ${submitLabel}`}
      >
        {body}
      </a>
    );
  }
  // Internal actions point at the deploy page with the action id so the
  // wizard can dispatch on it. Falls back to the bare provision path when
  // the action doesn't bind to a recognizable target.
  const to =
    action.target === 'blueprint'
      ? `${provisionPath}?action=${encodeURIComponent(action.id)}`
      : action.target === 'service'
        ? `/instances?action=${encodeURIComponent(action.id)}`
        : provisionPath;
  return (
    <Link
      to={to}
      aria-label={`${action.label} — ${submitLabel} (${serviceNoun})`}
    >
      {body}
    </Link>
  );
};

export default BlueprintAppLandingPage;
