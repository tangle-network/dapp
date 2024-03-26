import {
  randEthereumAddress,
  randRecentDate,
  randSoonDate,
} from '@ngneat/falso';

import { RestakingService } from '../../types';

type ServiceDetailsInfo = {
  serviceType: RestakingService;
  thresholds?: number;
  key?: string;
  startTimestamp: Date;
  endTimestamp: Date;
};

export default async function getServiceDetailsInfo(
  _: string
): Promise<ServiceDetailsInfo> {
  return {
    serviceType: RestakingService.ZK_SAAS_GROTH16,
    thresholds: 3,
    key: randEthereumAddress(),
    startTimestamp: randRecentDate({ days: 10 }),
    endTimestamp: randSoonDate({ days: 10 }),
  };
}
