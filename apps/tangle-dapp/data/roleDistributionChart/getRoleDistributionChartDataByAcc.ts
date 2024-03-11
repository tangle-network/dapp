import { rand } from '@ngneat/falso';

import type { PieChartItem } from '../../components/charts/types';
import { ProfileType, ServiceType } from '../../types';

export type RoleDistributionChartDataType = {
  profileType: ProfileType;
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
  const profileType = rand([ProfileType.INDEPENDENT, ProfileType.SHARED]);

  const data =
    profileType === ProfileType.INDEPENDENT
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
