import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  useAllBlueprints,
  useBlueprintDetails,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { NewSandboxCard } from '@tangle-network/sandbox-ui/dashboard';
import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
import type { BlueprintAppEntry } from '../../types';
import BlueprintModePicker from '../../components/BlueprintModePicker';
import { useBlueprintModes } from '../../useBlueprintModes';

type Props = {
  entry: BlueprintAppEntry;
};

const SandboxBlueprintLandingPage: FC<Props> = ({ entry }) => {
  const navigate = useNavigate();
  const { result: blueprintDetails } = useBlueprintDetails(entry.blueprintId, {
    enabled: entry.blueprintId !== undefined,
  });

  // The curated entry doesn't carry a blueprintId. Look up the canonical
  // sandbox blueprint from the catalog by matching `(publisher.namespace,
  // requestedSlug)` against `entry.match` — that's the same identity the
  // registry resolver uses.
  const { blueprints } = useAllBlueprints();
  const canonicalBlueprint = useMemo(() => {
    const candidates = Array.from(blueprints.values()).filter((bp) => {
      const ns = bp.blueprintUi?.publisher?.namespace?.toLowerCase();
      const slug = bp.blueprintUi?.requestedSlug?.toLowerCase();
      return ns === 'tangle' && slug === 'ai-agent-sandbox';
    });
    // Canonical = lowest on-chain id, matches catalog dedupe.
    return candidates.sort((a, b) => (a.id < b.id ? -1 : 1))[0] ?? null;
  }, [blueprints]);
  const modes = useBlueprintModes(canonicalBlueprint);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const activeMode = useMemo(() => {
    if (modes.length === 0) return null;
    return modes.find((m) => m.id === selectedModeId) ?? modes[0];
  }, [modes, selectedModeId]);

  const deployPath =
    activeMode !== null
      ? `/blueprints/${activeMode.blueprintId.toString()}/deploy`
      : entry.blueprintId !== undefined
        ? `/blueprints/${entry.blueprintId.toString()}/deploy`
        : '/blueprints/create';

  const metrics = useMemo(
    () => ({
      operators: blueprintDetails?.operators.length ?? 0,
    }),
    [blueprintDetails],
  );

  return (
    // The shell `<div>` already carries `data-sandbox-ui`. Re-declaring it
    // here would re-apply sandbox-ui's dark token defaults via the
    // `:root, [data-sandbox-ui]` rule and clobber the active vault/tangle
    // theme on this subtree.
    <div className="space-y-6">
      {modes.length > 1 && activeMode && (
        <BlueprintModePicker
          modes={modes}
          selectedModeId={activeMode.id}
          onSelect={(mode) => setSelectedModeId(mode.id)}
        />
      )}
      <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="space-y-3">
          <Badge variant="sandbox" dot>
            Agent runtime
          </Badge>
          <h1 className="font-display font-extrabold text-4xl text-foreground tracking-tight">
            Create an agent sandbox service
          </h1>
          <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed sm:text-base">
            Select operators, submit the service order, then use chat, files,
            tools, and runtime controls from the service page.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="sandbox" onClick={() => navigate(deployPath)}>
            Create sandbox service
          </Button>
          <Button variant="outline" onClick={() => navigate('/instances')}>
            View live services
          </Button>
          {(activeMode?.blueprintId ?? canonicalBlueprint?.id) !==
            undefined && (
            <Button
              variant="ghost"
              onClick={() =>
                navigate(
                  `/blueprints/${(
                    activeMode?.blueprintId ?? canonicalBlueprint?.id
                  )?.toString()}?raw=1`,
                )
              }
            >
              View on-chain
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.68fr_1.32fr]">
        <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 className="font-display font-bold text-foreground text-xl">
            Quick start
          </h2>
          <NewSandboxCard onClick={() => navigate(deployPath)} />
          <p className="text-muted-foreground text-sm leading-relaxed">
            Continue through the on-chain deploy flow and return here to operate
            the service.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="sandbox">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-xs">Protocol fit</p>
              <h3 className="mt-2 font-display font-bold text-foreground text-lg">
                Shared blueprint routes
              </h3>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                Sandbox keeps the canonical blueprint and service URLs, then
                adds richer runtime surfaces inside the same shell.
              </p>
            </CardContent>
          </Card>

          <Card variant="sandbox">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-xs">
                Operator readiness
              </p>
              <h3 className="mt-2 font-display font-bold text-foreground text-lg">
                {metrics.operators} indexed operators
              </h3>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                {metrics.operators > 0
                  ? 'The current index already exposes registered operators for this sandbox blueprint.'
                  : 'Operator readiness will populate here once the sandbox blueprint is indexed on the selected network.'}
              </p>
            </CardContent>
          </Card>

          <Card variant="sandbox">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-xs">Runtime surfaces</p>
              <h3 className="mt-2 font-display font-bold text-foreground text-lg">
                Chat, files, tools, terminal
              </h3>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                The curated sandbox module is where richer agent runtime views
                can live without forcing a separate website or origin.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SandboxBlueprintLandingPage;
