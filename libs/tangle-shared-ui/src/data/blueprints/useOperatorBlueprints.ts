import { toPrimitiveBlueprint } from './utils/toPrimitiveBlueprint';
import toPrimitiveService from './utils/toPrimitiveService';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { useCallback } from 'react';
import { catchError, map, of } from 'rxjs';

type OperatorBlueprint = {
  blueprintId: number;
  blueprint: ReturnType<typeof toPrimitiveBlueprint>;
  services: Array<ReturnType<typeof toPrimitiveService>>;
};

const useOperatorBlueprints = (operatorAccount?: string) => {
  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (
          apiRx.rpc?.services?.queryServicesWithBlueprintsByOperator ===
          undefined
        )
          // TODO: Should return the error here instead of throw it
          throw new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);

        if (!operatorAccount) return of<OperatorBlueprint[]>([]);

        return apiRx.rpc.services
          .queryServicesWithBlueprintsByOperator(operatorAccount)
          .pipe(
            map((servicesWithBlueprintsVec) => {
              return servicesWithBlueprintsVec.map(
                ({ blueprintId, blueprint, services }) => {
                  return {
                    blueprintId: blueprintId.toNumber(),
                    blueprint: toPrimitiveBlueprint(blueprint),
                    services: services.map(toPrimitiveService),
                  };
                },
              );
            }),
            catchError((error) => {
              console.error(
                'Error querying services with blueprints by operator:',
                error,
              );

              // TODO: Should return the error here
              return of<OperatorBlueprint[]>([]);
            }),
          );
      },
      [operatorAccount],
    ),
  );

  return {
    blueprints: result ?? [],
    ...rest,
  };
};

export default useOperatorBlueprints;
