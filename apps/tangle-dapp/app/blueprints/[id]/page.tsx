'use client';

import { ErrorFallback } from '@webb-tools/webb-ui-components/components/ErrorFallback';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import OperatorsTable from '../../../components/tables/Operators';
import BlueprintHeader from './BlueprintHeader';
import useBlueprintDetails from './useBlueprintDetails';

type Props = {
  params: {
    id: string;
  };
};

export const dynamic = 'force-static';

const BlueprintDetailsPage: FC<Props> = ({ params: { id } }) => {
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
    notFound();
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
