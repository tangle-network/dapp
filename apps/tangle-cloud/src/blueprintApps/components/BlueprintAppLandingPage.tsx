import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
import { useMemo, useState, type FC } from 'react';
import { Link } from 'react-router';
import { resolveBlueprintAppView } from '../resolver';
import type { BlueprintAppEntry } from '../types';
import type { TangleBlueprintAppEntry } from '../manifest';
import type { BlueprintIframeConfig } from '../iframe/types';
import BlueprintAppFrameHost from './BlueprintAppFrameHost';
import BlueprintModePicker from './BlueprintModePicker';
import { useBlueprint } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useBlueprintModes } from '../useBlueprintModes';

type Props = {
  entry: BlueprintAppEntry | TangleBlueprintAppEntry;
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

  return (
    // The shell `<div>` rendered by Layout already declares
    // `data-sandbox-ui` + `data-sandbox-theme`, and the sandbox-ui CSS resets
    // every token via `:root, [data-sandbox-ui]`. Re-declaring `data-sandbox-ui`
    // on an inner wrapper would re-apply those defaults under the inner element
    // and break theme inheritance (e.g. vault `--hsl-card` snapping back to the
    // dark default). Inner wrappers must NOT carry `data-sandbox-ui`.
    <div className="space-y-6">
      <Card variant="sandbox" className="overflow-hidden rounded-[32px]">
        <CardContent className="relative p-6 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--border-accent-hover)] to-transparent" />
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--brand-purple)]/20 blur-3xl" />

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-3xl space-y-4">
              <div className="space-y-2">
                <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-foreground md:text-5xl">
                  {view.manifest.displayName}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  {view.manifest.tagline}
                </p>
              </div>

              <p className="max-w-3xl text-base leading-7 text-foreground/90">
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

            <div className="space-y-4 rounded-3xl border border-border bg-[color:var(--bg-elevated)] p-5">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
                Checkout path
              </h2>
              <div className="grid gap-3">
                <Step index="1" title={`Configure the ${serviceNoun}`} />
                <Step index="2" title="Choose registered operators" />
                <Step index="3" title={`Track ${resourceNoun} output`} />
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

      {iframeConfig && (
        <Card variant="sandbox" className="overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            <BlueprintAppFrameHost
              config={iframeConfig}
              appDisplayName={view.manifest.displayName}
              mode={activeMode?.id}
              blueprintId={activeMode?.blueprintId ?? view.blueprintId}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard
          title="Cloud service"
          description={`Create a ${serviceNoun}, choose operators, and submit the service order.`}
        />
        <SummaryCard
          title="Runtime visibility"
          description={`Monitor ${resourceNoun} records, events, and operator output from the same page.`}
        />
        <SummaryCard
          title="Safe checkout"
          description="Approve service requests from your wallet without embedding third-party code in the flow."
        />
      </div>
    </div>
  );
};

const Step = ({ index, title }: { index: string; title: string }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-[color:var(--bg-card)] p-3">
    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {index}
    </span>
    <p className="text-sm font-semibold text-foreground">{title}</p>
  </div>
);

const SummaryCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Card variant="sandbox" className="rounded-3xl">
    <CardContent className="space-y-3 p-6">
      <Badge variant="sandbox" className="w-fit">
        {title}
      </Badge>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default BlueprintAppLandingPage;
