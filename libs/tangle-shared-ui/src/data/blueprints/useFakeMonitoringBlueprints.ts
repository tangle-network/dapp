import { useEffect, useState } from 'react';
import { InstanceStatus, MonitoringBlueprint } from './utils/type';
import randPrimitiveBlueprint from './utils/randPrimitiveBlueprint';
import randPrimitiveService from './utils/randPrimitiveService';
import { randNumber } from '@ngneat/falso';

const generateBlueprints = (operatorAccount: string): MonitoringBlueprint[] => {
  return Array.from({ length: 4 })
    .fill(null)
    .map((_, idx) => {
      const blueprint: MonitoringBlueprint['blueprint'] = {
        ...randPrimitiveBlueprint(idx),
        pricing: randNumber({ min: 0, max: 1000 }),
        pricingUnit: 'Hour',
        uptime: randNumber({ min: 0, max: 100 }),
        instanceCount: randNumber({ min: 0, max: 100 }),
        operatorsCount: randNumber({ min: 0, max: 100 }),
        tvl: randNumber({ min: 0, max: 1000000 }),
      };
      const service: MonitoringBlueprint['services'][number] = {
        ...randPrimitiveService(idx, operatorAccount),
        blueprintData: blueprint,
        uptime: randNumber({ min: 0, max: 100 }),
        earned: randNumber({ min: 0, max: 1000000 }),
        earnedInUsd: randNumber({ min: 0, max: 1000000 }),
        lastActive: new Date(),
        imgUrl: 'https://picsum.photos/200/300',
        instanceId: `i-${randNumber({ min: 0, max: 1000000 }).toString()}`,
        createdAtBlock: randNumber({ min: 0, max: 10000 }),
        ttl: randNumber({ min: 0, max: 10000 }),
      };
      return {
        blueprintId: idx,
        blueprint: blueprint,
        services: [
          {
            ...service,
            status: InstanceStatus.RUNNING,
          },
          {
            ...service,
            status: InstanceStatus.PENDING,
          },
          {
            ...service,
            status: InstanceStatus.STOPPED,
          },
        ],
      } satisfies MonitoringBlueprint;
    });
};

const useFakeMonitoringBlueprints = (
  operatorAccountAddress?: string,
  delayMs = 1000,
) => {
  const [data, setData] = useState<MonitoringBlueprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!operatorAccountAddress) return;

    setIsLoading(true);
    setData([]);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setData(generateBlueprints(operatorAccountAddress));
    }, delayMs);

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
      setData([]);
    };
  }, [operatorAccountAddress, delayMs]);

  return {
    blueprints: data,
    isLoading,
    error: null,
  };
};

export default useFakeMonitoringBlueprints;
