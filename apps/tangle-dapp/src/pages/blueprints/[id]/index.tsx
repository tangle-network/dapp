import OperatorsTable from '@webb-tools/tangle-shared-ui/components/tables/Operators';
import { ErrorFallback } from '@webb-tools/webb-ui-components/components/ErrorFallback';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { useParams } from 'react-router';
import getRestakeOperatorLink from '../../../utils/getRestakeOperatorLink';
import getViewOperatorLink from '../../../utils/getViewOperatorLink';
import BlueprintHeader from './BlueprintHeader';
import useBlueprintDetails from './useBlueprintDetails';

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
  }

  if (error) {
    return <ErrorFallback title={error.name} />;
  }

  if (result === null) {
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

        <OperatorsTable
          getRestakeOperatorLink={getRestakeOperatorLink}
          getViewOperatorLink={getViewOperatorLink}
          data={result.operators}
        />
      </div>
    </div>
  );
};

export default BlueprintDetailsPage;
