import { toPrimitiveServiceRequest } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/toPrimitiveService';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { useCallback, useMemo } from 'react';
import { catchError, combineLatest, map, of } from 'rxjs';
import { z } from 'zod';

const operatorStatsSchema = z.object({
  registeredBlueprints: z.number().default(0),
  runningServices: z.number().default(0),
  avgUptime: z.number().default(0),
  deployedServices: z.number().default(0),
  publishedBlueprints: z.number().default(0),
  pendingServices: z.number().default(0),
});

// TODO: Implement this
export const useOperatorStatsData = (
  operatorAddress: SubstrateAddress | null | undefined,
) => {
  const { result: operatorStats, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (!operatorAddress) {
          return of({});
        }

        const operatorProfile$ =
          apiRx.query.services?.operatorsProfile === undefined
            ? of({})
            : apiRx.query.services?.operatorsProfile(operatorAddress).pipe(
                map((operatorProfile) => {
                  if (operatorProfile.isNone) {
                    return {};
                  }

                  const detailed = operatorProfile.unwrap();
                  return {
                    registeredBlueprints: detailed.blueprints.strings.length,
                    runningServices: detailed.services.strings.length,
                  };
                }),
                catchError((error) => {
                  console.error(
                    'Error querying services with blueprints by operator profile:',
                    error,
                  );
                  return of({});
                }),
              );

        const serviceRequest$ =
          apiRx.query?.services?.serviceRequests === undefined
            ? of({})
            : apiRx.query.services?.serviceRequests.entries().pipe(
                map((serviceRequests) => {
                  const pendingServices = serviceRequests.filter(
                    ([requestId, serviceRequest]) => {
                      if (serviceRequest.isNone) {
                        return false;
                      }

                      const primitiveServiceRequest = toPrimitiveServiceRequest(
                        requestId,
                        serviceRequest.unwrap(),
                      );
                      return primitiveServiceRequest.operatorsWithApprovalState.some(
                        (operator) =>
                          operator.operator === operatorAddress &&
                          operator.approvalStateStatus === 'Pending',
                      );
                    },
                  );
                  return {
                    pendingServices: pendingServices.length,
                  };
                }),
                catchError((error) => {
                  console.error(
                    'Error querying services with blueprints by operator profile:',
                    error,
                  );
                  return of({});
                }),
              );

        const publishedBlueprints$ =
          apiRx.query.services?.blueprints === undefined
            ? of({})
            : apiRx.query.services?.blueprints?.entries().pipe(
                map((blueprints) => {
                  blueprints.filter(([_, optBlueprint]) => {
                    if (optBlueprint.isNone) {
                      return false;
                    }

                    const blueprint = optBlueprint.unwrap();
                    const publisher = blueprint[0].toHuman();
                    return publisher === operatorAddress;
                  });
                  return {
                    publishedBlueprints: blueprints.length,
                  };
                }),
                catchError((error) => {
                  console.error(
                    'Error querying services with blueprints:',
                    error,
                  );
                  return of({});
                }),
              );

        const deployedServices$ =
          apiRx.query.services?.instances === undefined
            ? of({})
            : apiRx.query.services?.instances.entries().pipe(
                map((instances) => {
                  instances.filter(([_, instance]) => {
                    if (instance.isNone) {
                      return false;
                    }
                    const detailed = instance.unwrap();
                    return detailed.owner.toHuman() === operatorAddress;
                  });
                  return instances.length;
                }),
                catchError((error) => {
                  console.error(
                    'Error querying services with blueprints:',
                    error,
                  );
                  return of({});
                }),
              );

        return combineLatest([
          operatorProfile$,
          serviceRequest$,
          publishedBlueprints$,
          deployedServices$,
        ]).pipe(
          map(
            ([
              operatorProfile,
              serviceRequest,
              publishedBlueprints,
              deployedServices,
            ]) => {
              return {
                ...operatorProfile,
                ...serviceRequest,
                ...publishedBlueprints,
                ...deployedServices,
              };
            },
          ),
        );
      },
      [operatorAddress],
    ),
  );

  const result = useMemo(() => {
    const parsed = operatorStatsSchema.safeParse(operatorStats);
    return parsed.success ? parsed.data : null;
  }, [operatorStats]);

  return {
    result,
    ...rest,
  };
};
