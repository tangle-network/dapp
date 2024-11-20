import { toPrimitiveBlueprint } from '@webb-tools/tangle-shared-ui/data/blueprints/utils/toPrimitiveBlueprint';
import toPrimitiveService from '@webb-tools/tangle-shared-ui/data/blueprints/utils/toPrimitiveService';
import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import {
  TangleError,
  TangleErrorCode,
} from '@webb-tools/tangle-shared-ui/types/error';
import { useCallback } from 'react';
import { catchError, map, of } from 'rxjs';

type OperatorBlueprint = {
  blueprintId: number;
  blueprint: ReturnType<typeof toPrimitiveBlueprint>;
  services: Array<ReturnType<typeof toPrimitiveService>>;
};

const useOperatorBlueprints = (operatorAccount: string) => {
  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (
          apiRx.rpc?.services?.queryServicesWithBlueprintsByOperator ===
          undefined
        )
          // TODO: Should return the error here instead of throw it
          throw new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);

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
