import { useEffect, useState } from 'react';
import { MonitoringBlueprint } from './utils/type';
import randPrimitiveBlueprint from './utils/randPrimitiveBlueprint';
import randPrimitiveService from './utils/randPrimitiveService';
import { randNumber } from '@ngneat/falso';
import { toSubstrateAddress } from '@tangle-network/ui-components';

const generateBlueprints = (operatorAccount: string): MonitoringBlueprint[] => {
  const operatorAccountAddress = toSubstrateAddress(operatorAccount);
  return Array.from({ length: 4 })
    .fill(null)
    .map((_, idx) => {
      const blueprint: MonitoringBlueprint['blueprint'] = {
        ...randPrimitiveBlueprint(idx),
        uptime: randNumber({ min: 0, max: 100 }),
        instanceCount: randNumber({ min: 0, max: 100 }),
        operatorsCount: randNumber({ min: 0, max: 100 }),
      };
      const service: MonitoringBlueprint['services'][number] = {
        ...randPrimitiveService(idx, operatorAccountAddress),
        blueprintData: blueprint,
        uptime: randNumber({ min: 0, max: 100 }),
        earned: randNumber({ min: 0, max: 1000000 }),
        earnedInUsd: randNumber({ min: 0, max: 1000000 }),
        lastActive: new Date(),
        externalInstanceId: `i-${randNumber({ min: 0, max: 1000000 }).toString()}`,
        createdAtBlock: randNumber({ min: 0, max: 10000 }),
        ttl: randNumber({ min: 0, max: 10000 }),
        pendingOperators: [
          operatorAccountAddress,
          operatorAccountAddress,
          operatorAccountAddress,
          operatorAccountAddress,
        ],
        approvedOperators: [
          operatorAccountAddress,
          operatorAccountAddress,
          operatorAccountAddress,
        ],
      };
      return {
        blueprintId: idx,
        blueprint: blueprint,
        services: [
          {
            ...service,
          },
          {
            ...service,
          },
          {
            ...service,
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
