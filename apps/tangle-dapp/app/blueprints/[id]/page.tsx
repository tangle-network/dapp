'use client';

import { Spinner } from '@webb-tools/icons/Spinner';
import { ErrorFallback } from '@webb-tools/webb-ui-components/components/ErrorFallback';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import BlueprintHeader from './BlueprintHeader';
import OperatorsTable from './OperatorsTable';
import useBlueprintDetails from './useBlueprintDetails';

type Props = {
  params: {
    id: string;
  };
};

const BlueprintDetailsPage: FC<Props> = ({ params: { id } }) => {
  const { result, isLoading, error } = useBlueprintDetails(id);

  if (isLoading) {
    return <Spinner size="xl" />;
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

      <OperatorsTable
        blueprintName={result.details.name}
        operators={result.operators}
      />
    </div>
  );
};

export default BlueprintDetailsPage;
