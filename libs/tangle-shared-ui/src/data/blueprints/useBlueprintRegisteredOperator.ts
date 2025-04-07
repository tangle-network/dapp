import { useCallback, useMemo } from 'react';
import { catchError, map, of } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';

export default function useBlueprintRegisteredOperator(blueprintId?: number) {
  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (apiRx.query.services?.operators === undefined)
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);

        if (blueprintId === null || blueprintId === undefined) {
          return of([]);
        }

        return apiRx.query.services.operators.entries(blueprintId).pipe(
          map(
            (entries) => {
              return entries.map(([storageKey, operatorPrefs]) => {
                const operatorAccount = storageKey.args[1].toString();
                const preferences = operatorPrefs.unwrapOrDefault().toHuman();
                return {
                  operatorAccount,
                  preferences: {
                    key: preferences.key,
                    priceTargets: {
                      cpu: formatLocaleStringToNumber(
                        // @ts-expect-error Property 'cpu' does not exist on type AnyJson[]
                        preferences?.priceTargets?.cpu || '0',
                      ),
                      mem: formatLocaleStringToNumber(
                        // @ts-expect-error Property 'mem' does not exist on type AnyJson[]
                        preferences?.priceTargets?.mem || '0',
                      ),
                      storageHdd: formatLocaleStringToNumber(
                        // @ts-expect-error Property 'storageHdd' does not exist on type AnyJson[]
                        preferences?.priceTargets?.storageHdd || '0',
                      ),
                      storageSsd: formatLocaleStringToNumber(
                        // @ts-expect-error Property 'storageSsd' does not exist on type AnyJson[]
                        preferences?.priceTargets?.storageSsd || '0',
                      ),
                      storageNvme: formatLocaleStringToNumber(
                        // @ts-expect-error Property 'storageNvme' does not exist on type AnyJson[]
                        preferences?.priceTargets?.storageNvme || '0',
                      ),
                    },
                  },
                };
              });
            },
            catchError((error) => {
              console.error(
                'Error querying services with blueprints by operator:',
                error,
              );
              return of([]);
            }),
          ),
        );
      },
      [blueprintId],
    ),
  );

  const data = useMemo(() => {
    return result ?? [];
  }, [result]);

  return {
    result: data,
    ...rest,
  };
}

function formatLocaleStringToNumber(value: string) {
  return Number(value.replace(/,/g, ''));
}
