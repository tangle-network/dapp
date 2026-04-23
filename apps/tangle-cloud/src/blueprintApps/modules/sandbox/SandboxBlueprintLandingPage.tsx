import type { FC } from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useBlueprintDetails } from '@tangle-network/tangle-shared-ui/data/graphql';
import { NewSandboxCard } from '@tangle-network/sandbox-ui/dashboard';
import { Button, Card, Typography } from '@tangle-network/ui-components';
import type { BlueprintAppEntry } from '../../types';
import SandboxUiStyles from './SandboxUiStyles';

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
      <SandboxUiStyles />
      <div className="rounded-[28px] border border-white/8 bg-[var(--depth-2)] p-6 shadow-[var(--shadow-card)]">
        <div className="space-y-3">
          <Typography variant="h3" fw="bold" className="text-white">
            Launch a durable agent sandbox
          </Typography>
          <Typography variant="body1" className="max-w-3xl text-white/72">
            Sandbox is now a real curated module inside the blueprint host. You
            provision through the shared cloud flow, then land in a route space
            built for chat, files, tools, and runtime operations.
          </Typography>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => navigate(deployPath)}>
            Provision sandbox service
          </Button>
          <Button variant="secondary" onClick={() => navigate('/instances')}>
            View live services
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.68fr_1.32fr]">
        <div className="space-y-4 rounded-[28px] border border-white/8 bg-[var(--depth-2)] p-5 shadow-[var(--shadow-card)]">
          <Typography variant="h4" fw="bold" className="text-white">
            Quick start
          </Typography>
          <NewSandboxCard onClick={() => navigate(deployPath)} />
          <Typography variant="body2" className="text-white/65">
            Start from the curated sandbox entrypoint, then continue through the
            existing onchain deploy flow.
          </Typography>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-[28px] border-white/8 bg-[var(--depth-2)] p-5 shadow-[var(--shadow-card)]">
            <Typography variant="body3" className="text-white/55">
              Protocol fit
            </Typography>
            <Typography variant="h5" fw="bold" className="mt-2 text-white">
              Shared blueprint routes
            </Typography>
            <Typography variant="body2" className="mt-3 text-white/70">
              Sandbox keeps the canonical blueprint and service URLs, then adds
              richer runtime surfaces inside the same shell.
            </Typography>
          </Card>

          <Card className="rounded-[28px] border-white/8 bg-[var(--depth-2)] p-5 shadow-[var(--shadow-card)]">
            <Typography variant="body3" className="text-white/55">
              Operator readiness
            </Typography>
            <Typography variant="h5" fw="bold" className="mt-2 text-white">
              {metrics.operators} indexed operators
            </Typography>
            <Typography variant="body2" className="mt-3 text-white/70">
              {metrics.operators > 0
                ? 'The current index already exposes registered operators for this sandbox blueprint.'
                : 'Operator readiness will populate here once the sandbox blueprint is indexed on the selected network.'}
            </Typography>
          </Card>

          <Card className="rounded-[28px] border-white/8 bg-[var(--depth-2)] p-5 shadow-[var(--shadow-card)]">
            <Typography variant="body3" className="text-white/55">
              Runtime surfaces
            </Typography>
            <Typography variant="h5" fw="bold" className="mt-2 text-white">
              Chat, files, tools, terminal
            </Typography>
            <Typography variant="body2" className="mt-3 text-white/70">
              The curated sandbox module is where richer agent runtime views can
              live without forcing a separate website or origin.
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SandboxBlueprintLandingPage;
