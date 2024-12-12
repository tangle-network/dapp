import { randNumber } from '@ngneat/falso';

import { type JobType, RestakingService } from '../../types';

const ALL_SERVICES = Object.values(RestakingService);

const randNum = () => randNumber({ min: 30, max: 100, precision: 1 });

const randServiceType = () => ALL_SERVICES[randNumber() % ALL_SERVICES.length];

const randJob = (id: number): JobType =>
  ({
    id,
    serviceType: randServiceType(),
    thresholds: randNum(),
    earnings: randNum(),
    expiration: randNum(),
  }) satisfies JobType;

export default async function getPastJobs(): Promise<JobType[]> {
  const length = randNumber({ min: 10, max: 30, precision: 1 });
  const startId = randNumber({ min: 30, max: 500, precision: 1 });

  return Array.from({ length }, (_, i) => randJob(startId + i));
}
