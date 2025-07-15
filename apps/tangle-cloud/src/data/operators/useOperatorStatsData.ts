import { toPrimitiveServiceRequest } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/toPrimitiveService';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { useCallback, useMemo } from 'react';
import { catchError, combineLatest, map, of } from 'rxjs';
import { z } from 'zod';
import { StorageKey, u64 } from '@polkadot/types';
import { toSubstrateAddress } from '@tangle-network/ui-components/utils/toSubstrateAddress';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const operatorStatsSchema = z.object({
  registeredBlueprints: z.number().default(0),
  runningServices: z.number().default(0),
  // TODO: Implement this
  avgUptime: z.number().default(0),
  deployedServices: z.number().default(0),
  publishedBlueprints: z.number().default(0),
  pendingServices: z.number().default(0),
});

export const useOperatorStatsData = (
  operatorAddress: SubstrateAddress | null | undefined,
) => {
  const { network } = useNetworkStore();

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
                  if ((operatorProfile as any).isNone) {
                    return {};
                  }

                  const detailed = (operatorProfile as any).unwrap();
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
                map((serviceRequests: any[]) => {
                  const pendingServices = serviceRequests.filter(
                    ([requestId, serviceRequest]) => {
                      if ((serviceRequest as any).isNone) {
                        return false;
                      }

                      const primitiveServiceRequest = toPrimitiveServiceRequest(
                        requestId as StorageKey<[u64]>,
                        (serviceRequest as any).unwrap(),
                      );
                      return primitiveServiceRequest.operatorsWithApprovalState.some(
                        (operator) => {
                          const normalizedChainOperator = toSubstrateAddress(
                            operator.operator,
                            network.ss58Prefix,
                          );
                          const normalizedCurrentOperator = operatorAddress
                            ? toSubstrateAddress(
                                operatorAddress,
                                network.ss58Prefix,
                              )
                            : null;

                          const addressMatch =
                            normalizedChainOperator ===
                            normalizedCurrentOperator;
                          const statusMatch =
                            operator.approvalStateStatus === 'Pending';

                          return addressMatch && statusMatch;
                        },
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
                map((blueprints: any[]) => {
                  const publishedBlueprints = blueprints.filter(
                    ([_, optBlueprint]) => {
                      if ((optBlueprint as any).isNone) {
                        return false;
                      }

                      const blueprint = (optBlueprint as any).unwrap();
                      const publisher = blueprint[0].toHuman();
                      return publisher === operatorAddress;
                    },
                  );
                  return {
                    publishedBlueprints: publishedBlueprints.length,
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

        // TODO: after the instance is terminated, this will be removed. using Graphql to get the deployed services
        const deployedServices$ =
          apiRx.query.services?.instances === undefined
            ? of({})
            : apiRx.query.services?.instances.entries().pipe(
                map((instances: any[]) => {
                  const deployedServices = instances.filter(([_, instance]) => {
                    if ((instance as any).isNone) {
                      return false;
                    }
                    const detailed = (instance as any).unwrap();
                    return detailed.owner.toHuman() === operatorAddress;
                  });
                  return {
                    deployedServices: deployedServices.length,
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
      [operatorAddress, network.ss58Prefix],
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
