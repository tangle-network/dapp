import BlueprintHeader from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@tangle-network/tangle-shared-ui/data/restake/useBlueprintDetails';
import { ErrorFallback } from '@tangle-network/ui-components/components/ErrorFallback';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useMemo } from 'react';
import { Navigate, useParams } from 'react-router';
import { z } from 'zod';
import { PagePath } from '../../../types';

const BlueprintDetailsPage: FC = () => {
  const { id: idParam } = useParams();

  const id = useMemo(() => {
    if (idParam === undefined) {
      return undefined;
    }

    const result = z.coerce.bigint().safeParse(idParam);

    return result.success ? result.data : undefined;
  }, [idParam]);

  const { result, isLoading, error } = useBlueprintDetails(id);

  if (result === null || id === undefined) {
    return <Navigate to={PagePath.NOT_FOUND} />;
  } else if (isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonLoader className="min-h-64" />

        <Typography variant="h4" fw="bold">
          Operators running
        </Typography>

        <SkeletonLoader className="min-h-52" />
      </div>
    );
  } else if (error !== null) {
    return <ErrorFallback title={error.name} />;
  }

  return (
    <div className="space-y-5">
      <BlueprintHeader blueprint={result.details} />

      <div className="space-y-5">
        <Typography variant="h4" fw="bold">
          Operators running {result.details.name}
        </Typography>

        <OperatorsTable data={result.operators} />
      </div>
    </div>
  );
};

export default BlueprintDetailsPage;
