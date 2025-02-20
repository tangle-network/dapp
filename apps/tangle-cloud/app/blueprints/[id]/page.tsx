'use client';

import React from 'react';
import BlueprintHeader from '@webb-tools/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@webb-tools/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@webb-tools/tangle-shared-ui/data/restake/useFakeBlueprintDetails';
import { ErrorFallback } from '@webb-tools/webb-ui-components/components/ErrorFallback';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components/components/TableAndChartTabs';
import { TabContent } from '@webb-tools/webb-ui-components/components/Tabs/TabContent';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { TangleDAppPagePath } from '../../../types';
import { Blueprint } from '@webb-tools/tangle-shared-ui/types/blueprint';

export const dynamic = 'force-static';

const RestakeOperatorAction = ({
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
          Registered Operators
        </Typography>
        <SkeletonLoader className="min-h-52" />
      </div>
    );
  } else if (error) {
    return <ErrorFallback title={error.name} />;
  } else if (result === null) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <BlueprintHeader blueprint={{...result.details, registrationParams: result.details.registrationParams}} />

      <TableAndChartTabs
        tabs={['README', 'Jobs']}
        headerClassName="w-full"
      >
        <TabContent value="README">
          <div className="bg-card glass rounded-lg">
            <div className="prose dark:prose-invert max-w-none p-6">
              {result.details.readme.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <Typography key={i} variant="h2" fw="bold">{line.slice(2)}</Typography>;
                }
                if (line.startsWith('## ')) {
                  return <Typography key={i} variant="h4" fw="bold" className="mt-4">{line.slice(3)}</Typography>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i}>{line.slice(2)}</li>;
                }
                return <p key={i}>{line}</p>;
              })}
            </div>
          </div>
        </TabContent>

        <TabContent value="Jobs">
          <div className="bg-card glass rounded-lg">
            <div className="space-y-4 p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Job Name</th>
                    <th className="text-left p-4">Description</th>
                    <th className="text-left p-4">Parameters</th>
                    <th className="text-left p-4">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.jobs.map((job) => (
                    <tr key={job.id} className="border-b">
                      <td className="p-4">{job.name}</td>
                      <td className="p-4">{job.description}</td>
                      <td className="p-4">{job.params.join(', ') || '-'}</td>
                      <td className="p-4">{job.result.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabContent>
      </TableAndChartTabs>

      <div className="space-y-5">
        <Typography variant="h4" fw="bold">
          Registered Operators
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
