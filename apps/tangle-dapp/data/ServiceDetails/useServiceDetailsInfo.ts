'use client';

import { randRecentDate, randSoonDate } from '@ngneat/falso';
import { useContext, useEffect, useState } from 'react';

import { RestakingService } from '../../types';

type ServiceDetailsInfo = {
  serviceType: RestakingService;
  thresholds?: number;
  startTimestamp: Date;
  endTimestamp: Date;
};

export default function useServiceDetailsInfo(serviceId: string) {
  useEffect(() => {
    // 1. Check cache
    // 2. No cache, fetch data
  }, []);

  return {
    serviceType: RestakingService.ZK_SAAS_GROTH16,
    thresholds: 3,
    startTimestamp: randRecentDate({ days: 10 }),
    endTimestamp: randSoonDate({ days: 10 }),
  } satisfies ServiceDetailsInfo;
}
