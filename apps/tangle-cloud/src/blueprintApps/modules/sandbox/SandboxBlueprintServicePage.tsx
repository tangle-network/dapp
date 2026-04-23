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
import { Button, Card, Typography } from '@tangle-network/ui-components';
import { useAccount } from 'wagmi';
import type { JobCall } from '@tangle-network/tangle-shared-ui/data/graphql';
import type { BlueprintAppEntry } from '../../types';
import { getBlueprintPath, resolveBlueprintAppView } from '../../resolver';
import { PagePath } from '../../../types';
import SandboxUiStyles from './SandboxUiStyles';

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
    <div data-sandbox-ui className="space-y-6">
      <SandboxUiStyles />
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
        <Card
          id="sandbox-service-details"
          className="rounded-[28px] border-white/8 bg-[var(--depth-2)] p-6 shadow-[var(--shadow-card)]"
        >
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

        <Card className="rounded-[28px] border-white/8 bg-[var(--depth-2)] p-6 shadow-[var(--shadow-card)]">
          <div className="space-y-4">
            <div>
              <Typography variant="h5" fw="bold" className="text-white">
                Recent sandbox activity
              </Typography>
              <Typography variant="body2" className="mt-2 text-white/65">
                Indexed calls for this service from the shared protocol data
                plane.
              </Typography>
            </div>

            <div className="space-y-3">
              {recentCalls.length > 0 ? (
                recentCalls.slice(0, 6).map((call: JobCall) => (
                  <div
                    key={call.id}
                    className="rounded-2xl border border-white/8 bg-[var(--depth-3)] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Typography variant="body1" className="text-white">
                          Call #{call.callId.toString()}
                        </Typography>
                        <Typography
                          variant="body2"
                          className="mt-1 text-white/62"
                        >
                          Job {call.jobIndex} ·{' '}
                          {call.completed
                            ? `${call.resultCount} result${call.resultCount === 1 ? '' : 's'}`
                            : 'Pending execution'}
                        </Typography>
                      </div>
                      <Typography variant="body3" className="text-white/55">
                        {new Date(
                          Number(call.submittedAt) * 1000,
                        ).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[var(--depth-3)] p-5">
                  <Typography variant="body2" className="text-white/60">
                    No job activity indexed for this service yet.
                  </Typography>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to={PagePath.SERVICE_DETAILS.replace(':id', serviceId)}>
                <Button>Open protocol service console</Button>
              </Link>
              <Link to={getBlueprintPath(view)}>
                <Button variant="secondary">Back to sandbox blueprint</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SandboxBlueprintServicePage;
