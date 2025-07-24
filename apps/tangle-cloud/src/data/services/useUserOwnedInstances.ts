import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { useCallback, useMemo } from 'react';
import { catchError, combineLatest, map, of } from 'rxjs';
import { MonitoringBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { toPrimitiveService } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/toPrimitiveService';
import { toPrimitiveBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/toPrimitiveBlueprint';
import { Option, StorageKey, u64 } from '@polkadot/types';
import {
  TanglePrimitivesServicesService,
  TanglePrimitivesServicesServiceServiceBlueprint,
} from '@polkadot/types/lookup';
import { AccountId32 } from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';

export const useUserOwnedInstances = (
  userAddress: SubstrateAddress | null | undefined,
  refreshTrigger?: number,
) => {
  const { result: userOwnedData, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (!userAddress) {
          return of([]);
        }

        // Get all service instances owned by the user
        const userOwnedInstances$ =
          apiRx.query.services?.instances === undefined
            ? of([])
            : apiRx.query.services?.instances
                .entries<Option<TanglePrimitivesServicesService>>()
                .pipe(
                  map((instances) => {
                    return instances
                      .filter(([_, instance]) => {
                        if (instance.isNone) {
                          return false;
                        }
                        const detailed = instance.unwrap();
                        const ownerAddress = detailed.owner.toString();

                        try {
                          const normalizedOwner = encodeAddress(
                            decodeAddress(ownerAddress),
                          );
                          const normalizedUser = encodeAddress(
                            decodeAddress(userAddress),
                          );

                          return normalizedOwner === normalizedUser;
                        } catch (error) {
                          console.error('Address normalization error:', error);
                          return ownerAddress === userAddress;
                        }
                      })
                      .map(([_key, instance]) => {
                        const primitiveService = toPrimitiveService(
                          instance.unwrap(),
                        );
                        return primitiveService;
                      });
                  }),
                  catchError((error) => {
                    console.error(
                      'Error querying user owned service instances:',
                      error,
                    );
                    return of([]);
                  }),
                );

        // Get blueprints data for the owned instances
        const blueprints$ =
          apiRx.query.services?.blueprints === undefined
            ? of([])
            : apiRx.query.services?.blueprints
                .entries<
                  Option<
                    ITuple<
                      [
                        AccountId32,
                        TanglePrimitivesServicesServiceServiceBlueprint,
                      ]
                    >
                  >
                >()
                .pipe(
                  map((blueprints) => {
                    return blueprints
                      .filter(([_, blueprint]) => !blueprint.isNone)
                      .map(([key, blueprint]) => {
                        const [_, serviceBlueprint] = blueprint.unwrap();
                        const blueprintId = (
                          key as StorageKey<[u64]>
                        ).args[0].toBigInt();
                        return toPrimitiveBlueprint(
                          blueprintId,
                          serviceBlueprint,
                        );
                      });
                  }),
                  catchError((error) => {
                    console.error(
                      'Error querying blueprints for user owned instances:',
                      error,
                    );
                    return of([]);
                  }),
                );

        return combineLatest([userOwnedInstances$, blueprints$]).pipe(
          map(([userOwnedInstances, blueprints]) => {
            // Create a map of blueprint ID to blueprint data
            const blueprintMap = new Map(
              blueprints.map((blueprint) => [
                blueprint.id.toString(),
                blueprint,
              ]),
            );

            // Transform to MonitoringBlueprint format
            const monitoringBlueprints: MonitoringBlueprint[] = [];
            const blueprintServicesMap = new Map<
              string,
              MonitoringBlueprint['services']
            >();

            // Group services by blueprint
            userOwnedInstances.forEach((service) => {
              const blueprintId = service.blueprint.toString();
              const blueprintData = blueprintMap.get(blueprintId);

              if (blueprintData) {
                const serviceWithBlueprint = {
                  ...service,
                  blueprintData,
                };

                if (!blueprintServicesMap.has(blueprintId)) {
                  blueprintServicesMap.set(blueprintId, []);
                }
                const services = blueprintServicesMap.get(blueprintId);
                if (services) {
                  services.push(serviceWithBlueprint);
                }
              }
            });

            // Create MonitoringBlueprint objects
            blueprintServicesMap.forEach((services, blueprintId) => {
              const blueprintData = blueprintMap.get(blueprintId);
              if (blueprintData) {
                monitoringBlueprints.push({
                  blueprintId: blueprintData.id,
                  blueprint: blueprintData,
                  services,
                });
              }
            });

            return monitoringBlueprints;
          }),
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [userAddress, refreshTrigger],
    ),
  );

  const result = useMemo(() => {
    return userOwnedData || [];
  }, [userOwnedData]);

  return {
    result,
    ...rest,
  };
};

export default useUserOwnedInstances;
