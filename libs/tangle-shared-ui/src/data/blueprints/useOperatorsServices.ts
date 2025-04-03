import { toPrimitiveService } from './utils/toPrimitiveService';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { useCallback, useMemo } from 'react';
import { catchError, map, of } from 'rxjs';
import { OperatorBlueprint } from './utils/type';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { assertSubstrateAddress } from '@tangle-network/ui-components';

const useOperatorsServices = (operatorAccounts?: SubstrateAddress[]) => {
  const operatorSet = useMemo(
    () => (operatorAccounts ? new Set(operatorAccounts) : null),
    [operatorAccounts],
  );

  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (!apiRx.query?.services?.instances) {
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
        }

        if (!operatorSet) return of(new Map());

        return apiRx.query.services.instances.entries().pipe(
          map((servicesVec) => {
            const servicesMap = new Map<
              SubstrateAddress,
              OperatorBlueprint['services']
            >();

            operatorSet.forEach((operator) => {
              servicesMap.set(assertSubstrateAddress(operator), []);
            });

            servicesVec.forEach(([_, value]) => {
              if (!value.isSome) return;

              const primitiveService = toPrimitiveService(value.unwrap());

              primitiveService.operatorSecurityCommitments.forEach(
                ({ operator }) => {
                  if (operatorSet.has(operator)) {
                    servicesMap.get(operator)?.push(primitiveService);
                  }
                },
              );
            });

            for (const [operator, services] of servicesMap) {
              if (services.length === 0) {
                servicesMap.delete(operator);
              }
            }

            return servicesMap;
          }),
          catchError((error) => {
            console.error(
              'Error querying services with blueprints by operator:',
              error,
            );
            return of(new Map());
          }),
        );
      },
      [operatorSet],
    ),
  );

  const operatorServices = useMemo(() => {
    return result || new Map();
  }, [result]);

  return {
    result: operatorServices,
    ...rest,
  };
};

export default useOperatorsServices;
