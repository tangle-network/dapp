import BlueprintHeader from '@webb-tools/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@webb-tools/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@webb-tools/tangle-shared-ui/data/restake/useBlueprintDetails';
import { ErrorFallback } from '@webb-tools/webb-ui-components/components/ErrorFallback';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { TangleDAppPagePath } from '../../../types';

export const dynamic = 'force-static';

const ViewOperatorWrapper = ({
  children,
  address,
}: PropsWithChildren<{ address: string }>) => {
  return (
    <Link
      href={`${TangleDAppPagePath.RESTAKE_OPERATOR}/${address}`}
      target="_blank"
    >
      {children}
    </Link>
  );
};

const RestakeOperatorWrapper = ({
  children,
  address,
}: PropsWithChildren<{ address: string }>) => {
  return (
    <Link
      href={`${TangleDAppPagePath.RESTAKE_OPERATOR}/${address}`}
      target="_blank"
    >
      {children}
    </Link>
  );
};

const Page = ({ params }: { params: { id: string } }) => {
  const { id } = params;

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
          ViewOperatorWrapper={ViewOperatorWrapper}
          RestakeOperatorWrapper={RestakeOperatorWrapper}
          data={result.operators}
        />
      </div>
    </div>
  );
};

export default Page;
