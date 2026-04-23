import { Button, Typography } from '@tangle-network/ui-components';
import type { FC } from 'react';
import { Link } from 'react-router';
import type { SchemaField } from '@tangle-network/tangle-shared-ui/codec';
import type { BlueprintJobDefinition } from '@tangle-network/tangle-shared-ui/data/services';
import type { JobCall } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  getBlueprintExperienceTierLabel,
  getBlueprintPath,
  getBlueprintServicePath,
  getBlueprintSurfaceLabel,
  resolveBlueprintAppView,
} from '../resolver';
import type { BlueprintAppEntry } from '../types';
import { PagePath } from '../../types';

type Props = {
  entry: BlueprintAppEntry;
  serviceId: string;
  liveDetails?: {
    status: string;
    owner: string;
    operators: string[];
    permittedCallers: string[];
    viewerAccess?: 'owner' | 'permitted-caller' | 'public';
  };
  requestSchemaFields?: SchemaField[];
  jobs?: BlueprintJobDefinition[];
  recentCalls?: JobCall[];
};

const KIND_LABELS: Record<number, string> = {
  0: 'Void',
  1: 'Bool',
  2: 'Uint8',
  3: 'Int8',
  4: 'Uint16',
  5: 'Int16',
  6: 'Uint32',
  7: 'Int32',
  8: 'Uint64',
  9: 'Int64',
  10: 'Uint128',
  11: 'Int128',
  12: 'Uint256',
  13: 'Int256',
  14: 'Address',
  15: 'Bytes32',
  16: 'FixedBytes',
  17: 'String',
  18: 'Bytes',
  19: 'Optional',
  20: 'Array',
  21: 'List',
  22: 'Struct',
};

const formatSchemaField = (field: SchemaField): string => {
  const kind = KIND_LABELS[field.kind] ?? `Kind ${field.kind}`;
  if (field.kind === 20 && field.children[0]) {
    return `${field.name}: ${KIND_LABELS[field.children[0].kind] ?? 'Unknown'}[${field.arrayLength}]`;
  }
  if ((field.kind === 19 || field.kind === 21) && field.children[0]) {
    return `${field.name}: ${kind}<${KIND_LABELS[field.children[0].kind] ?? 'Unknown'}>`;
  }
  if (field.kind === 22) {
    return `${field.name}: Struct (${field.children.length} fields)`;
  }
  return `${field.name}: ${kind}`;
};

const BlueprintAppServicePage: FC<Props> = ({
  entry,
  serviceId,
  liveDetails,
  requestSchemaFields,
  jobs,
  recentCalls,
}) => {
  const view = resolveBlueprintAppView(entry);
  const serviceConsolePath = PagePath.SERVICE_DETAILS.replace(':id', serviceId);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-mono-160/10 bg-mono-0/[0.04] p-6 md:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex rounded-full border border-mono-160/10 bg-mono-0/[0.05] px-3 py-1">
            <Typography variant="body3" className="text-mono-80">
              {getBlueprintExperienceTierLabel(view.tier)}
            </Typography>
          </div>

          <Typography variant="h2" fw="bold">
            {view.manifest.displayName} service #{serviceId}
          </Typography>
          <Typography variant="body1" className="text-mono-80">
            This is the service-level host surface for the {view.slug} blueprint
            app. It is where the shell resolves public instance detail,
            operator-backed resources, generic protocol surfaces, and any
            approved module UI.
          </Typography>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-mono-160/10 bg-mono-0/[0.04] p-4">
              <Typography variant="body3" className="text-mono-80">
                Route
              </Typography>
              <Typography variant="body2" className="text-mono-0 mt-1">
                {getBlueprintServicePath(view, serviceId)}
              </Typography>
            </div>
            <div className="rounded-2xl border border-mono-160/10 bg-mono-0/[0.04] p-4">
              <Typography variant="body3" className="text-mono-80">
                Resource
              </Typography>
              <Typography variant="body2" className="text-mono-0 mt-1">
                {view.manifest.resources.resourceNoun}
              </Typography>
            </div>
            <div className="rounded-2xl border border-mono-160/10 bg-mono-0/[0.04] p-4">
              <Typography variant="body3" className="text-mono-80">
                Blueprint
              </Typography>
              <Typography variant="body2" className="text-mono-0 mt-1">
                {view.slug}
              </Typography>
            </div>
            <div className="rounded-2xl border border-mono-160/10 bg-mono-0/[0.04] p-4">
              <Typography variant="body3" className="text-mono-80">
                Service ID
              </Typography>
              <Typography variant="body2" className="text-mono-0 mt-1">
                {serviceId}
              </Typography>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {view.manifest.surfaces.map((surface) => (
              <span
                key={surface}
                className="rounded-full border border-mono-160/10 bg-mono-0/[0.05] px-3 py-1 text-xs text-mono-100"
              >
                {getBlueprintSurfaceLabel(surface)}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={getBlueprintPath(view)}>
              <Button variant="secondary">Blueprint homepage</Button>
            </Link>
            <Link to={serviceConsolePath}>
              <Button>Open service console</Button>
            </Link>
            <Link to="/instances">
              <Button variant="secondary">All services</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-3xl border border-mono-160/10 bg-mono-0/[0.03] p-6">
          <Typography variant="h4" fw="bold">
            Public overview
          </Typography>
          <Typography variant="body2" className="mt-3 text-mono-100">
            Show public metadata, operator set, uptime, permissions, and
            discoverable resources for this service even when no custom app
            module exists.
          </Typography>
        </section>

        <section className="rounded-3xl border border-mono-160/10 bg-mono-0/[0.03] p-6">
          <Typography variant="h4" fw="bold">
            App surfaces
          </Typography>
          <Typography variant="body2" className="mt-3 text-mono-100">
            Mount blueprint-specific routes under this service, like chat,
            vaults, runs, bots, or agents, without creating a new website per
            blueprint.
          </Typography>
        </section>

        <section className="rounded-3xl border border-mono-160/10 bg-mono-0/[0.03] p-6">
          <Typography variant="h4" fw="bold">
            Extensibility boundary
          </Typography>
          <Typography variant="body2" className="mt-3 text-mono-100">
            Resolve operator-backed APIs or external app handoff behind one host
            surface later, instead of exposing raw IPs or forcing one subdomain
            per blueprint.
          </Typography>
        </section>
      </div>

      {(liveDetails ||
        (requestSchemaFields && requestSchemaFields.length > 0)) && (
        <div className="grid gap-5 lg:grid-cols-2">
          {liveDetails && (
            <section className="rounded-3xl border border-mono-160/10 bg-mono-0/[0.03] p-6">
              <Typography variant="h4" fw="bold">
                Live service access
              </Typography>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <Typography variant="body3" className="text-mono-80">
                    Status
                  </Typography>
                  <Typography variant="body2" className="mt-1 text-mono-0">
                    {liveDetails.status}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body3" className="text-mono-80">
                    Owner
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mt-1 text-mono-0 break-all"
                  >
                    {liveDetails.owner}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body3" className="text-mono-80">
                    Operators
                  </Typography>
                  <Typography variant="body2" className="mt-1 text-mono-0">
                    {liveDetails.operators.length}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body3" className="text-mono-80">
                    Permitted callers
                  </Typography>
                  <Typography variant="body2" className="mt-1 text-mono-0">
                    {liveDetails.permittedCallers.length}
                  </Typography>
                </div>
                <div className="sm:col-span-2">
                  <Typography variant="body3" className="text-mono-80">
                    Connected wallet access
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mt-1 text-mono-0 capitalize"
                  >
                    {liveDetails.viewerAccess ?? 'public'}
                  </Typography>
                </div>
              </div>
            </section>
          )}

          {requestSchemaFields && requestSchemaFields.length > 0 && (
            <section className="rounded-3xl border border-mono-160/10 bg-mono-0/[0.03] p-6">
              <Typography variant="h4" fw="bold">
                Request schema
              </Typography>
              <div className="mt-4 flex flex-col gap-2">
                {requestSchemaFields.map((field) => (
                  <div
                    key={`${field.name}-${field.kind}-${field.arrayLength}`}
                    className="rounded-2xl border border-mono-160/10 bg-mono-0/[0.04] px-4 py-3"
                  >
                    <Typography variant="body2" className="text-mono-0">
                      {formatSchemaField(field)}
                    </Typography>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <section className="rounded-3xl border border-mono-160/10 bg-mono-0/[0.03] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Typography variant="h4" fw="bold">
                Supported actions
              </Typography>
              <Typography variant="body2" className="mt-2 text-mono-100">
                Generic host rendering for valid onchain jobs. Richer modules
                can override this later, but every blueprint still gets an
                actionable baseline.
              </Typography>
            </div>
            <Link to={serviceConsolePath}>
              <Button variant="secondary">Submit jobs</Button>
            </Link>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {jobs.map((job, index) => (
              <div
                key={`${job.name}-${index}`}
                className="rounded-2xl border border-mono-160/10 bg-mono-0/[0.04] p-4"
              >
                <Typography variant="body1" fw="semibold">
                  {job.name || `Job #${index}`}
                </Typography>
                <Typography variant="body2" className="mt-2 text-mono-100">
                  {job.description || 'No job description published.'}
                </Typography>
                <div className="mt-3 space-y-2">
                  <Typography variant="body3" className="text-mono-80">
                    Params:{' '}
                    {job.hasParamsSchema ? job.parsedParamsSchema.length : 0}{' '}
                    fields
                  </Typography>
                  <Typography variant="body3" className="text-mono-80">
                    Result:{' '}
                    {job.hasResultSchema ? job.parsedResultSchema.length : 0}{' '}
                    fields
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentCalls && recentCalls.length > 0 && (
        <section className="rounded-3xl border border-mono-160/10 bg-mono-0/[0.03] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Typography variant="h4" fw="bold">
                Recent service activity
              </Typography>
              <Typography variant="body2" className="mt-2 text-mono-100">
                Indexed job traffic gives generic blueprint pages enough signal
                to show whether a service is idle or actively being used.
              </Typography>
            </div>
            <Link to={serviceConsolePath}>
              <Button variant="secondary">Inspect history</Button>
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {recentCalls.slice(0, 5).map((call) => (
              <div
                key={call.id}
                className="rounded-2xl border border-mono-160/10 bg-mono-0/[0.04] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Typography variant="body2" className="text-mono-0">
                    Job #{call.jobIndex} · Call {call.callId.toString()}
                  </Typography>
                  <Typography variant="body3" className="text-mono-80">
                    {call.completed ? 'Completed' : 'Pending'} ·{' '}
                    {call.resultCount} result{call.resultCount === 1 ? '' : 's'}
                  </Typography>
                </div>
                <Typography
                  variant="body3"
                  className="mt-2 text-mono-80 break-all"
                >
                  Submitter: {call.submitter}
                </Typography>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlueprintAppServicePage;
