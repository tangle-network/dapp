import type { FC } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  InfoPanel,
  PromoBanner,
  SandboxCard,
  type SandboxCardData,
} from '@tangle-network/sandbox-ui/dashboard';
import {
  useJobsByService,
  useServiceById,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useIsPermittedCaller } from '@tangle-network/tangle-shared-ui/data/services';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
} from '@tangle-network/sandbox-ui/primitives';
import { useAccount } from 'wagmi';
import type { JobCall } from '@tangle-network/tangle-shared-ui/data/graphql';
import type { BlueprintAppEntry } from '../../types';
import { getBlueprintPath, resolveBlueprintAppView } from '../../resolver';
import { PagePath } from '../../../types';

type Props = {
  entry: BlueprintAppEntry;
  serviceId: string;
};

const toSandboxStatus = (
  status: 'ACTIVE' | 'TERMINATED' | undefined,
  hasPendingCalls: boolean,
): SandboxCardData['status'] => {
  if (status === 'TERMINATED') {
    return 'stopped';
  }

  if (hasPendingCalls) {
    return 'provisioning';
  }

  return 'running';
};

const SandboxBlueprintServicePage: FC<Props> = ({ entry, serviceId }) => {
  const numericServiceId = BigInt(serviceId);
  const { data: service } = useServiceById(numericServiceId);
  const { data: recentCalls = [] } = useJobsByService(numericServiceId);
  const { address } = useAccount();
  const { data: isPermittedCaller } = useIsPermittedCaller(
    numericServiceId,
    address,
  );
  const view = resolveBlueprintAppView(entry);

  const sandbox = useMemo<SandboxCardData | null>(() => {
    if (!service) {
      return null;
    }

    const pendingCalls = recentCalls.filter((call) => !call.completed).length;

    return {
      id: serviceId,
      name: `${entry.manifest.displayName} #${serviceId}`,
      nodeId: service.owner,
      status: toSandboxStatus(service.status, pendingCalls > 0),
      provisioningMessage:
        pendingCalls > 0 ? `${pendingCalls} pending call(s)` : undefined,
      provisioningPercent: pendingCalls > 0 ? 60 : undefined,
    };
  }, [entry.manifest.displayName, recentCalls, service, serviceId]);

  const accessLabel = !service
    ? 'Loading access'
    : address?.toLowerCase() === service.owner.toLowerCase()
      ? 'Owner access'
      : isPermittedCaller
        ? 'Permitted caller'
        : 'Public viewer';

  const openServiceConsole = () => {
    window.location.assign(PagePath.SERVICE_DETAILS.replace(':id', serviceId));
  };

  const focusDetails = () => {
    document
      .getElementById('sandbox-service-details')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // Shell already sets `data-sandbox-ui`. Re-declaring here resets the
    // sandbox-ui token defaults under the subtree (dark theme bleeds into
    // vault). Inner wrappers stay attribute-free.
    <div className="space-y-6">
      {sandbox && (
        <SandboxCard
          sandbox={sandbox}
          onOpenIDE={openServiceConsole}
          onOpenTerminal={focusDetails}
          onUsage={focusDetails}
          onHealth={focusDetails}
        />
      )}

      <PromoBanner
        title={`${entry.manifest.displayName} service #${serviceId}`}
        description="This curated sandbox module keeps the shared blueprint host routing, then layers sandbox-specific operator and runtime context on top."
        buttonLabel="Open protocol service console"
        onClick={() => {
          window.location.assign(
            PagePath.SERVICE_DETAILS.replace(':id', serviceId),
          );
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <Card id="sandbox-service-details" variant="sandbox" className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoPanel
              label="Access"
              title={accessLabel}
              description={
                service
                  ? `${service.operators.length} operator(s), ${service.permittedCallers.length} permitted caller(s), ${recentCalls.length} indexed call(s).`
                  : 'Loading service access profile.'
              }
            />
            <InfoPanel
              label="Blueprint route"
              title={getBlueprintPath(view)}
              description="Canonical host route for this curated sandbox blueprint."
            />
            <InfoPanel
              label="Resource model"
              title={`${entry.manifest.resources.resourceNoun} runtime`}
              description="Chat, files, tools, and terminal-oriented surfaces can mount here without leaving the shared cloud shell."
            />
            <InfoPanel
              label="Current state"
              title={
                service?.status === 'ACTIVE'
                  ? 'Ready for richer runtime views'
                  : 'Waiting for active runtime state'
              }
              description={
                service?.status === 'ACTIVE'
                  ? 'Service is live and indexed. Curated runtime panels can safely layer on top of this route.'
                  : 'Service exists, but the richer runtime module should stay conservative until the service is active.'
              }
            />
          </div>
        </Card>

        <Card variant="sandbox">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="font-display font-bold text-foreground text-xl">
                  Recent sandbox activity
                </h2>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  Indexed calls for this service from the shared protocol data
                  plane.
                </p>
              </div>

              <div className="space-y-3">
                {recentCalls.length > 0 ? (
                  recentCalls.slice(0, 6).map((call: JobCall) => (
                    <div
                      key={call.id}
                      className="rounded-lg border border-border bg-muted/30 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            Call #{call.callId.toString()}
                          </p>
                          <p className="mt-1 text-muted-foreground text-sm">
                            Job {call.jobIndex} ·{' '}
                            {call.completed
                              ? `${call.resultCount} result${call.resultCount === 1 ? '' : 's'}`
                              : 'Pending execution'}
                          </p>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {new Date(
                            Number(call.submittedAt) * 1000,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No job activity yet"
                    description="No jobs have been indexed for this service yet."
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to={PagePath.SERVICE_DETAILS.replace(':id', serviceId)}>
                  <Button variant="sandbox">
                    Open protocol service console
                  </Button>
                </Link>
                <Link to={getBlueprintPath(view)}>
                  <Button variant="outline">Back to sandbox blueprint</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SandboxBlueprintServicePage;
