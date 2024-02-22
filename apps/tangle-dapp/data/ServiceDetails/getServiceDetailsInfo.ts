import {
  randEthereumAddress,
  randRecentDate,
  randSoonDate,
} from '@ngneat/falso';

import { ServiceType } from '../../types';

type ServiceDetailsInfo = {
  serviceType: ServiceType;
  thresholds?: number;
  key?: string;
  startTimestamp: Date;
  endTimestamp: Date;
};

export default async function getServiceDetailsInfo(
  _: string
): Promise<ServiceDetailsInfo> {
  return {
    serviceType: ServiceType.ZK_SAAS_GROTH16,
    thresholds: 3,
    key: randEthereumAddress(),
    startTimestamp: randRecentDate({ days: 10 }),
    endTimestamp: randSoonDate({ days: 10 }),
  };
}
