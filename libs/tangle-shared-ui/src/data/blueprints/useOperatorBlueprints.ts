import { toPrimitiveBlueprint } from './utils/toPrimitiveBlueprint';
import { toPrimitiveService } from './utils/toPrimitiveService';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { useCallback } from 'react';
import { catchError, map, of } from 'rxjs';
import { OperatorBlueprint } from './utils/type';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

const useOperatorBlueprints = (operatorAddress?: SubstrateAddress) => {
  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (
          apiRx.rpc?.services?.queryServicesWithBlueprintsByOperator ===
          undefined
        ) {
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
        } else if (operatorAddress === undefined) {
          return of<OperatorBlueprint[]>([]);
        }

        return apiRx.rpc.services
          .queryServicesWithBlueprintsByOperator(operatorAddress)
          .pipe(
            map((servicesWithBlueprintsVec) => {
              return servicesWithBlueprintsVec.map(
                ({ blueprintId, blueprint, services }) => {
                  return {
                    blueprintId: blueprintId.toBigInt(),
                    blueprint: toPrimitiveBlueprint(
                      blueprintId.toBigInt(),
                      blueprint,
                    ),
                    services: services.map(toPrimitiveService),
                  };
                },
              );
            }),
            catchError((error: unknown) => {
              console.error(
                'Error querying services with blueprints by operator:',
                error,
              );

              // TODO: Should return the error here
              return of<OperatorBlueprint[]>([]);
            }),
          );
      },
      [operatorAddress],
    ),
  );

  return {
    blueprints: result ?? [],
    ...rest,
  };
};

export default useOperatorBlueprints;
