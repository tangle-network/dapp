import type { FC } from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useBlueprintDetails } from '@tangle-network/tangle-shared-ui/data/graphql';
import { NewSandboxCard } from '@tangle-network/sandbox-ui/dashboard';
import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
import type { BlueprintAppEntry } from '../../types';

type Props = {
  entry: BlueprintAppEntry;
};

const SandboxBlueprintLandingPage: FC<Props> = ({ entry }) => {
  const navigate = useNavigate();
  const { result: blueprintDetails } = useBlueprintDetails(entry.blueprintId, {
    enabled: entry.blueprintId !== undefined,
  });

  const deployPath =
    entry.blueprintId !== undefined
      ? `/blueprints/${entry.blueprintId.toString()}/deploy`
      : '/blueprints/create';

  const metrics = useMemo(
    () => ({
      operators: blueprintDetails?.operators.length ?? 0,
    }),
    [blueprintDetails],
  );

  return (
    <div data-sandbox-ui className="space-y-6">
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
