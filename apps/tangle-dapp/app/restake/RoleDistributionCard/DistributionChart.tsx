'use client';

import assert from 'assert';
import { FC } from 'react';
import { formatUnits } from 'viem';

import {
  IndependentRoleDistributionChart,
  SharedRoleDistributionChart,
} from '../../../components/charts';
import { TANGLE_TOKEN_DECIMALS } from '../../../constants';
import { RestakingProfileType, RestakingService } from '../../../types';
import getChartDataAreaColorByServiceType from '../../../utils/getChartDataAreaColorByServiceType';
import { DistributionDataType } from './types';

type DistributionChartProps = {
  data: DistributionDataType | null;
  profileType?: RestakingProfileType | null;
};

const DistributionChart: FC<DistributionChartProps> = ({
  data,
  profileType,
}) => {
  const distribution = !data
    ? []
    : Object.entries(data).map(([name, value]) => {
        assertRestakingService(name);

        return {
          name,
          // Dummy check to whether format the total restaked amount
          // or not, as the local testnet is in wei but the live one is in unit
          value:
            value.toString().length > 10
              ? +formatUnits(BigInt(value.toString()), TANGLE_TOKEN_DECIMALS)
              : +value.toString(),
          color: getChartDataAreaColorByServiceType(name),
        };
      });

  return (
    <div className="flex items-center justify-center">
      {profileType === RestakingProfileType.SHARED ? (
        <SharedRoleDistributionChart data={distribution} />
      ) : (
        <IndependentRoleDistributionChart
          data={distribution}
          title={profileType ? 'Independent' : 'No data'}
        />
      )}
    </div>
  );
};

export default DistributionChart;

function assertRestakingService(
  name: string
): asserts name is RestakingService {
  assert(
    Object.values(RestakingService).includes(name as RestakingService),
    `Invalid RestakingService: ${name}`
  );
}
