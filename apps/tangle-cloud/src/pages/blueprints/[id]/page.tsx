import {
  useBlueprint,
  useBlueprintDetails,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import OperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import { Card, Typography } from '@tangle-network/ui-components';
import { Navigate, Link } from 'react-router';
import type { FC, PropsWithChildren } from 'react';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { z } from 'zod';
import BlueprintAppLandingPage from '../../../blueprintApps/components/BlueprintAppLandingPage';
import { renderCuratedBlueprintLanding } from '../../../blueprintApps/modules';
import { getBlueprintAppBySlug } from '../../../blueprintApps/registry';
import {
  getBlueprintPath,
  toBlueprintAppEntry,
} from '../../../blueprintApps/resolver';
import { PagePath } from '../../../types';
import { useResolvedBlueprintViewFromIndexedBlueprint } from '../../../blueprintApps/useResolvedBlueprintView';
import { TangleDAppPagePath } from '../../../types';
import BlueprintHostCard from '../../../components/blueprintApps/BlueprintHostCard';

const StakingOperatorAction: FC<PropsWithChildren<{ address: string }>> = ({
  children,
}) => {
  return (
    <Link to={TangleDAppPagePath.STAKING_DELEGATE} target="_blank">
      {children}
    </Link>
  );
};

const Page: FC = () => {
  const id = useParamWithSchema('id', z.string().min(1));
  const numericId = id && /^\d+$/.test(id) ? BigInt(id) : undefined;
  const { data: blueprint, isLoading: isLoadingBlueprint } = useBlueprint(
    numericId?.toString(),
    {
      enabled: numericId !== undefined,
    },
  );
  const { result: blueprintDetails, isLoading: isLoadingDetails } =
    useBlueprintDetails(numericId, {
      enabled: numericId !== undefined,
    });
  const resolvedView = useResolvedBlueprintViewFromIndexedBlueprint(blueprint);
  const entry = id ? getBlueprintAppBySlug(id) : null;

  if (!id) {
    return <Navigate to={PagePath.NOT_FOUND} replace />;
  }

  if (entry) {
    const curated = renderCuratedBlueprintLanding(entry);
    if (curated) {
      return curated;
    }
    return <BlueprintAppLandingPage entry={entry} />;
  }

  if (numericId !== undefined) {
    if (isLoadingBlueprint || isLoadingDetails) {
      return (
        <div className="space-y-5">
          <SkeletonLoader className="min-h-40" />
          <SkeletonLoader className="min-h-52" />
        </div>
      );
    }

    if (!blueprint || !blueprintDetails || !resolvedView) {
      return <Navigate to={PagePath.NOT_FOUND} replace />;
    }

    if (resolvedView.tier !== 'generic') {
      return <Navigate to={getBlueprintPath(resolvedView)} replace />;
    }

    return (
      <div className="space-y-8">
        <BlueprintAppLandingPage entry={toBlueprintAppEntry(resolvedView)} />
        <BlueprintHostCard blueprint={blueprintDetails.details} />

        <Card className="rounded-3xl p-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="h4" fw="bold">
                Registered operators
              </Typography>
              <Typography variant="body2" className="text-mono-100">
                {blueprintDetails.operators.length} indexed
              </Typography>
            </div>

            <OperatorsTable
              StakingOperatorAction={StakingOperatorAction}
              data={blueprintDetails.operators as any}
              isLoading={false}
            />
          </section>
        </Card>
      </div>
    );
  }

  return <Navigate to={PagePath.NOT_FOUND} replace />;
};

export default Page;
