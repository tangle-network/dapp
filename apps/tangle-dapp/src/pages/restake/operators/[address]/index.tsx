'use client';

import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import { isSubstrateAddress } from '@webb-tools/webb-ui-components';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { notFound } from 'next/navigation';
import { ComponentProps, useMemo } from 'react';

import { useParams } from 'react-router';
import useOperatorBlueprints from '../../../../data/blueprints/useOperatorBlueprints';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeTVL from '../../../../data/restake/useRestakeTVL';
import OperatorInfoCard from './OperatorInfoCard';
import RegisteredBlueprintsCard from './RegisteredBlueprintsCard';
import TVLTable from './TVLTable';

const Page = () => {
  const { address } = useParams();
  const { operatorMap } = useRestakeOperatorMap();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorTVL, vaultTVL, delegatorTVL } = useRestakeTVL(
    operatorMap,
    delegatorInfo,
  );

  const { isLoading, blueprints, error } = useOperatorBlueprints(address);

  const blueprintsUI = useMemo<
    ComponentProps<typeof RegisteredBlueprintsCard>['blueprints']
  >(
    () =>
      blueprints.map(
        ({
          blueprint: {
            metadata: { name, logo, codeRepository },
          },
          blueprintId,
        }) => ({
          id: blueprintId.toString(),
          avatarUrl: logo,
          name,
          githubUrl: codeRepository,
        }),
      ),
    [blueprints],
  );

  if (address === undefined || !isSubstrateAddress(address)) {
    return notFound();
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-stretch gap-5 max-h-none md:max-h-[290px]">
        <OperatorInfoCard
          className="flex-1"
          operatorData={operatorMap[address]}
          operatorAddress={address}
          operatorMap={operatorMap}
          delegatorInfo={delegatorInfo}
          operatorTVL={operatorTVL}
        />

        <RegisteredBlueprintsCard
          className="flex-1"
          blueprints={blueprintsUI}
          isLoading={isLoading}
          error={error && error.message}
        />
      </div>

      <div>
        <Typography variant="h4" fw="bold" className="py-4">
          Total Value Locked
        </Typography>

        <TVLTable
          operatorData={operatorMap[address]}
          vaultTVL={vaultTVL}
          delegatorInfo={delegatorInfo}
          delegatorTVL={delegatorTVL}
        />
      </div>
    </div>
  );
};

export default Page;
