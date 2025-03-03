import { useEffect, useState } from 'react';
import { MonitoringBlueprint } from './utils/type';
import randPrimitiveBlueprint from './utils/randPrimitiveBlueprint';
import randPrimitiveService from './utils/randPrimitiveService';
import { randNumber } from '@ngneat/falso';

const generateBlueprints = (operatorAccount: string): MonitoringBlueprint[] => {
  return Array.from({ length: 4 })
    .fill(null)
    .map((_, idx) => {
      return {
        blueprintId: idx,
        blueprint: {
          ...randPrimitiveBlueprint(idx),
          pricing: randNumber({ min: 0, max: 1000 }),
          pricingUnit: 'Hour',
          uptime: randNumber({ min: 0, max: 100 }),
          instanceCount: randNumber({ min: 0, max: 100 }),
          operatorsCount: randNumber({ min: 0, max: 100 }),
          tvl: randNumber({ min: 0, max: 1000000 }),
        },
        services: [randPrimitiveService(idx, operatorAccount)],
      } satisfies MonitoringBlueprint;
    });
};

const useFakeMonitoringBlueprints = (
  operatorAccountAddress?: string,
  delayMs = 3000,
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
