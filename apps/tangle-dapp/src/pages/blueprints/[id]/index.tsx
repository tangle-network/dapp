import BlueprintHeader from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@tangle-network/tangle-shared-ui/data/restake/useBlueprintDetails';
import { ErrorFallback } from '@tangle-network/ui-components/components/ErrorFallback';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC } from 'react';
import { Navigate } from 'react-router';
import { PagePath } from '../../../types';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { z } from 'zod';

const BlueprintDetailsPage: FC = () => {
  const id = useParamWithSchema('id', z.coerce.bigint());
  const { result, isLoading, error } = useBlueprintDetails(id);

  if (id === undefined) {
    return <Navigate to={PagePath.NOT_FOUND} />;
  } else if (isLoading || result === null) {
    return (
      <div className="space-y-5">
        <SkeletonLoader className="min-h-64" />

        <Typography variant="h4" fw="bold">
          Registered Operators
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
          Registered Operators
        </Typography>

        <OperatorsTable data={result.operators} />
      </div>
    </div>
  );
};

export default BlueprintDetailsPage;
