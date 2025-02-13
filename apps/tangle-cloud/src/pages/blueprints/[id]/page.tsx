import BlueprintHeader from '@webb-tools/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@webb-tools/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@webb-tools/tangle-shared-ui/data/restake/useBlueprintDetails';
import { ErrorFallback } from '@webb-tools/webb-ui-components/components/ErrorFallback';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { PropsWithChildren } from 'react';
import { Link, useParams } from 'react-router';
import { TangleDAppPagePath } from '../../../types';

const RestakeOperatorAction = ({
  children,
  address,
}: PropsWithChildren<{ address: string }>) => {
  return (
    <Link
      to={`${TangleDAppPagePath.RESTAKE_OPERATOR}/${address}`}
      target="_blank"
    >
      {children}
    </Link>
  );
};

const Page = () => {
  const { id } = useParams();

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
  } else if (error) {
    return <ErrorFallback title={error.name} />;
  } else if (result === null) {
    // TODO: Show 404 page
    return null;
  }

  return (
    <div className="space-y-10">
      <BlueprintHeader blueprint={result.details} />

      <div className="space-y-5">
        <Typography variant="h4" fw="bold">
          Operators running {result.details.name}
        </Typography>

        <OperatorsTable
          RestakeOperatorAction={RestakeOperatorAction}
          data={result.operators}
        />
      </div>
    </div>
  );
};

export default Page;
