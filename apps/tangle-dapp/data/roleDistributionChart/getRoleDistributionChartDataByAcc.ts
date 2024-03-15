import { rand } from '@ngneat/falso';

import type { PieChartItem } from '../../components/charts/types';
import { RestakingProfileType, ServiceType } from '../../types';
import getChartAreaColorByServiceType from '../../utils/getChartDataAreaColorByServiceType';

export type RoleDistributionChartDataType = {
  profileType: RestakingProfileType;
  distribution: PieChartItem[];
};

const mockIndependentData = [
  { name: ServiceType.ZK_SAAS_GROTH16, value: 400 },
  { name: ServiceType.ZK_SAAS_MARLIN, value: 300 },
  { name: ServiceType.LIGHT_CLIENT_RELAYING, value: 300 },
  { name: ServiceType.TSS_DFNS_CGGMP21SECP256K1, value: 200 },
];

// For Shared profile, all values of services are the same
const mockSharedData = [
  { name: ServiceType.ZK_SAAS_GROTH16, value: 400 },
  { name: ServiceType.ZK_SAAS_MARLIN, value: 400 },
  { name: ServiceType.LIGHT_CLIENT_RELAYING, value: 400 },
  { name: ServiceType.TSS_DFNS_CGGMP21SECP256K1, value: 400 },
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
