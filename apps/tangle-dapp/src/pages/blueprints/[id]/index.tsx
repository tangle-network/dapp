import BlueprintHeader from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@tangle-network/tangle-shared-ui/data/restake/useBlueprintDetails';
import { ErrorFallback } from '@tangle-network/webb-ui-components/components/ErrorFallback';
import SkeletonLoader from '@tangle-network/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@tangle-network/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { useParams } from 'react-router';

const BlueprintDetailsPage: FC = () => {
  const { id = '' } = useParams();
  const { result, isLoading, error } = useBlueprintDetails(id);

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
  } else if (error !== null) {
    return <ErrorFallback title={error.name} />;
  } else if (result === null) {
    // TODO: Should redirect to the 404 page
    return null;
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
