import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
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
  const serviceNoun = view.manifest.resources.serviceNoun;
  const resourceNoun = view.manifest.resources.resourceNoun;

  return (
    <div data-sandbox-ui className="space-y-6">
      <Card variant="sandbox" className="overflow-hidden rounded-[32px]">
        <CardContent className="relative p-6 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--brand-purple)]/20 blur-3xl" />

          <div className="relative max-w-4xl space-y-5">
            <Badge variant="sandbox" className="w-fit">
              {getBlueprintExperienceTierLabel(view.tier)}
            </Badge>

            <div className="space-y-3">
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-white md:text-5xl">
                {view.manifest.displayName} service #{serviceId}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-white/70">
                Manage this live {serviceNoun.toLowerCase()}: check access,
                inspect callable jobs, review recent activity, and open the full
                service console when you need to operate the instance.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ServiceMetric
                label="Route"
                value={getBlueprintServicePath(view, serviceId)}
              />
              <ServiceMetric label="Resource" value={resourceNoun} />
              <ServiceMetric label="Blueprint" value={view.slug} />
              <ServiceMetric label="Service ID" value={serviceId} />
            </div>

            <div className="flex flex-wrap gap-2">
              {view.manifest.surfaces.map((surface) => (
                <Badge key={surface} variant="sandbox">
                  {getBlueprintSurfaceLabel(surface)}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild variant="secondary">
                <Link to={getBlueprintPath(view)}>Blueprint homepage</Link>
              </Button>
              <Button asChild>
                <Link to={serviceConsolePath}>Open service console</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/instances">All services</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <ServiceCard
          title="Access"
          description="See who owns the service, which wallets may call it, and how many operators are backing the instance."
        />
        <ServiceCard
          title="Actions"
          description="Submit supported blueprint jobs through the generic service console, even before a custom app module exists."
        />
        <ServiceCard
          title="Activity"
          description="Use recent indexed calls to tell whether the instance is idle, pending results, or actively producing output."
        />
      </div>

      {(liveDetails ||
        (requestSchemaFields && requestSchemaFields.length > 0)) && (
        <div className="grid gap-5 lg:grid-cols-2">
          {liveDetails && (
            <Card variant="sandbox" className="rounded-3xl">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
                  Live service access
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/42">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {liveDetails.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/42">
                      Owner
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-white">
                      {liveDetails.owner}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/42">
                      Operators
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {liveDetails.operators.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/42">
                      Permitted callers
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {liveDetails.permittedCallers.length}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/42">
                      Connected wallet access
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-white">
                      {liveDetails.viewerAccess ?? 'public'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {requestSchemaFields && requestSchemaFields.length > 0 && (
            <Card variant="sandbox" className="rounded-3xl">
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
                  Request schema
                </h2>
                <div className="mt-4 flex flex-col gap-2">
                  {requestSchemaFields.map((field) => (
                    <div
                      key={`${field.name}-${field.kind}-${field.arrayLength}`}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-white">
                        {formatSchemaField(field)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <Card variant="sandbox" className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
                  Supported actions
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
                  Valid onchain jobs are callable from the service console. A
                  richer blueprint module can improve the form later, but the
                  service remains operable now.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link to={serviceConsolePath}>Submit jobs</Link>
              </Button>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {jobs.map((job, index) => (
                <div
                  key={`${job.name}-${index}`}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <h3 className="font-display text-lg font-bold text-white">
                    {job.name || `Job #${index}`}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    {job.description || 'No job description published.'}
                  </p>
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-white/50">
                      Params:{' '}
                      {job.hasParamsSchema ? job.parsedParamsSchema.length : 0}{' '}
                      fields
                    </p>
                    <p className="text-xs font-semibold text-white/50">
                      Result:{' '}
                      {job.hasResultSchema ? job.parsedResultSchema.length : 0}{' '}
                      fields
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recentCalls && recentCalls.length > 0 && (
        <Card variant="sandbox" className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
                  Recent service activity
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
                  Indexed job traffic gives generic blueprint pages enough
                  signal to show whether a service is idle or actively being
                  used.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link to={serviceConsolePath}>Inspect history</Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {recentCalls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      Job #{call.jobIndex} · Call {call.callId.toString()}
                    </p>
                    <p className="text-xs font-semibold text-white/50">
                      {call.completed ? 'Completed' : 'Pending'} ·{' '}
                      {call.resultCount} result
                      {call.resultCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <p className="mt-2 break-all text-xs font-semibold text-white/50">
                    Submitter: {call.submitter}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ServiceMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
    <p className="text-xs font-bold uppercase tracking-widest text-white/42">
      {label}
    </p>
    <p className="mt-2 truncate text-sm font-semibold text-white" title={value}>
      {value}
    </p>
  </div>
);

const ServiceCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Card variant="sandbox" className="rounded-3xl">
    <CardContent className="space-y-3 p-6">
      <h2 className="font-display text-xl font-extrabold tracking-tight text-white">
        {title}
      </h2>
      <p className="text-sm leading-6 text-white/62">{description}</p>
    </CardContent>
  </Card>
);

export default BlueprintAppServicePage;
