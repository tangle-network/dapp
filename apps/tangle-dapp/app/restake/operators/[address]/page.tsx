'use client';

import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { notFound } from 'next/navigation';

import useRestakeDelegatorInfo from '../../../../data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '../../../../data/restake/useRestakeOperatorMap';
import useRestakeTVL from '../../../../data/restake/useRestakeTVL';
import OperatorInfoCard from './OperatorInfoCard';
import RegisteredBlueprintsCard from './RegisteredBlueprintsCard';
import TVLTable from './TVLTable';

export const dynamic = 'force-static';

const Page = ({ params: { address } }: { params: { address: string } }) => {
  const { operatorMap } = useRestakeOperatorMap();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorTVL, poolTVL, delegatorTVL } = useRestakeTVL(
    operatorMap,
    delegatorInfo,
  );

  if (operatorMap[address] === undefined) {
    notFound();
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

        <RegisteredBlueprintsCard className="flex-1" />
      </div>

      <div>
        <Typography variant="h4" fw="bold" className="py-4">
          Total Value Locked
        </Typography>

        <TVLTable
          operatorData={operatorMap[address]}
          vaultTVL={poolTVL}
          delegatorInfo={delegatorInfo}
          delegatorTVL={delegatorTVL}
        />
      </div>
    </div>
  );
};

export default Page;
