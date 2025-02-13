'use client';

import BlueprintHeader from '@webb-tools/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@webb-tools/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@webb-tools/tangle-shared-ui/data/restake/useBlueprintDetails';
import { ErrorFallback } from '@webb-tools/webb-ui-components/components/ErrorFallback';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useParams, Navigate } from 'react-router-dom';
import { PagePath } from '../types';

export default function BlueprintDetails() {
  const { id } = useParams<{ id: string }>();
  const { result, isLoading, error } = useBlueprintDetails(id ?? '');

  if (!id) {
    return <Navigate to={PagePath.BLUEPRINTS} replace />;
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonLoader className="min-h-64" />

        <Typography variant="h4" fw="bold">
          Operators running
        </Typography>

        <SkeletonLoader className="min-h-52" />
      </div>
    );
  } else if (error) {
    return <ErrorFallback title={error.name} />;
  } else if (result === null) {
    return <Navigate to={PagePath.BLUEPRINTS} replace />;
  }

  return (
    <div className="space-y-10">
      <BlueprintHeader blueprint={result.details} />

      <div className="space-y-5">
        <Typography variant="h4" fw="bold">
          Operators running {result.details.name}
        </Typography>

        <OperatorsTable data={result.operators} />
      </div>
    </div>
  );
}
