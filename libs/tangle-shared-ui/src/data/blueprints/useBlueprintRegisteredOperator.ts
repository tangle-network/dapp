import { useCallback, useMemo } from 'react';
import { catchError, map, of } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { z } from 'zod';

const priceTargetsSchema = z.object({
  cpu: z.string().default('0'),
  mem: z.string().default('0'),
  storageHdd: z.string().default('0'),
  storageSsd: z.string().default('0'),
  storageNvme: z.string().default('0'),
});

const preferencesSchema = z.object({
  priceTargets: priceTargetsSchema.optional(),
});

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
                const parsedPreferences =
                  preferencesSchema.safeParse(preferences);
                const priceTargets = parsedPreferences.success
                  ? parsedPreferences.data.priceTargets
                  : undefined;
                return {
                  operatorAccount,
                  preferences: {
                    key: preferences.key,
                    priceTargets: {
                      cpu: formatLocaleStringToNumber(priceTargets?.cpu || '0'),
                      mem: formatLocaleStringToNumber(priceTargets?.mem || '0'),
                      storageHdd: formatLocaleStringToNumber(
                        priceTargets?.storageHdd || '0',
                      ),
                      storageSsd: formatLocaleStringToNumber(
                        priceTargets?.storageSsd || '0',
                      ),
                      storageNvme: formatLocaleStringToNumber(
                        priceTargets?.storageNvme || '0',
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
