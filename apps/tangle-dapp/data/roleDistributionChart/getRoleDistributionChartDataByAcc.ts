import { rand } from '@ngneat/falso';
import { BN } from '@polkadot/util';

import type { PieChartItem } from '../../components/charts/types';
import { RestakingProfileType, RestakingService } from '../../types';
import getChartAreaColorByServiceType from '../../utils/getChartDataAreaColorByServiceType';

export type RoleDistributionChartDataType = {
  profileType: RestakingProfileType;
  distribution: PieChartItem[];
};

const mockIndependentData = [
  { name: RestakingService.ZK_SAAS_GROTH16, value: new BN('400') },
  { name: RestakingService.ZK_SAAS_MARLIN, value: new BN('300') },
  { name: RestakingService.LIGHT_CLIENT_RELAYING, value: new BN('300') },
  { name: RestakingService.TSS_DFNS_CGGMP21SECP256K1, value: new BN('200') },
];

// For Shared profile, all values of services are the same
const mockSharedData = [
  { name: RestakingService.ZK_SAAS_GROTH16, value: new BN('400') },
  { name: RestakingService.ZK_SAAS_MARLIN, value: new BN('400') },
  { name: RestakingService.LIGHT_CLIENT_RELAYING, value: new BN('400') },
  { name: RestakingService.TSS_DFNS_CGGMP21SECP256K1, value: new BN('400') },
];

export default async function getRoleDistributionChartDataByAcc(
  _: string
): Promise<RoleDistributionChartDataType> {
  const profileType = rand([
    RestakingProfileType.INDEPENDENT,
    RestakingProfileType.SHARED,
  ]);

  const data =
    profileType === RestakingProfileType.INDEPENDENT
      ? mockIndependentData
      : mockSharedData;

  const distribution = data.map((role) => {
    return { ...role, color: getChartAreaColorByServiceType(role.name) };
  });

  return {
    profileType,
    distribution,
  };
}
