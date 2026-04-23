import {
  useBlueprint,
  useJobsByService,
  useServiceById,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useAccount } from 'wagmi';
import { useIsPermittedCaller } from '@tangle-network/tangle-shared-ui/data/services';
import { useBlueprintRequestSchema } from '../../../../../data/services/useBlueprintRequestSchema';
import { useBlueprintJobs } from '@tangle-network/tangle-shared-ui/data/services';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import type { FC } from 'react';
import { Navigate } from 'react-router';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { z } from 'zod';
import BlueprintAppServicePage from '../../../../../blueprintApps/components/BlueprintAppServicePage';
import { PagePath } from '../../../../../types';
import {
  getBlueprintServicePath,
  toBlueprintAppEntry,
} from '../../../../../blueprintApps/resolver';
import { useResolvedBlueprintViewFromIndexedBlueprint } from '../../../../../blueprintApps/useResolvedBlueprintView';

const Page: FC = () => {
  const id = useParamWithSchema('id', z.coerce.bigint());
  const serviceId = useParamWithSchema('serviceId', z.coerce.bigint());

  const { data: blueprint, isLoading: isLoadingBlueprint } = useBlueprint(
    id?.toString(),
  );
  const { data: service, isLoading: isLoadingService } =
    useServiceById(serviceId);
  const { data: recentCalls, isLoading: isLoadingJobs } =
    useJobsByService(serviceId);
  const { data: requestSchema } = useBlueprintRequestSchema(id);
  const { data: jobs } = useBlueprintJobs(id);
  const { address } = useAccount();
  const { data: isPermittedCaller } = useIsPermittedCaller(serviceId, address);

  const resolvedView = useResolvedBlueprintViewFromIndexedBlueprint(blueprint);

  if (isLoadingBlueprint || isLoadingService || isLoadingJobs) {
    return (
      <div className="space-y-5">
        <SkeletonLoader className="min-h-40" />
        <SkeletonLoader className="min-h-52" />
      </div>
    );
  }

  if (!id || !serviceId || !blueprint || !service) {
    return <Navigate to={PagePath.NOT_FOUND} replace />;
  }

  if (service.blueprintId !== id) {
    return <Navigate to={PagePath.NOT_FOUND} replace />;
  }

  if (!resolvedView) {
    return <Navigate to={PagePath.NOT_FOUND} replace />;
  }

  if (resolvedView.tier !== 'generic') {
    return (
      <Navigate
        to={getBlueprintServicePath(resolvedView, serviceId.toString())}
        replace
      />
    );
  }

  return (
    <BlueprintAppServicePage
      entry={toBlueprintAppEntry(resolvedView)}
      serviceId={serviceId.toString()}
      liveDetails={{
        status: service.status,
        owner: service.owner,
        operators: service.operators,
        permittedCallers: service.permittedCallers,
        viewerAccess:
          address?.toLowerCase() === service.owner.toLowerCase()
            ? 'owner'
            : isPermittedCaller
              ? 'permitted-caller'
              : 'public',
      }}
      requestSchemaFields={requestSchema?.parsedRequestSchema ?? []}
      jobs={jobs ?? []}
      recentCalls={recentCalls ?? []}
    />
  );
};

export default Page;
