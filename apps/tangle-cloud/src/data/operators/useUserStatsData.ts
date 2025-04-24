import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { useCallback, useMemo } from 'react';
import { catchError, combineLatest, map, of } from 'rxjs';
import { z } from 'zod';

const userStatsSchema = z.object({
  runningServices: z.number().default(0),
  deployedServices: z.number().default(0),
  pendingServices: z.number().default(0),
  consumedServices: z.number().default(0),
});

export const useUserStatsData = (accountAddress: string | null | undefined) => {
  const { result: userStats, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (!accountAddress) {
          return of({});
        }

        const runningServices$ =
          apiRx.query.services?.instances === undefined
            ? of({})
            : apiRx.query.services?.instances.entries().pipe(
                map((instances) => {
                  const runningServices = instances.filter(([_, instance]) => {
                    if (instance.isNone) {
                      return false;
                    }
                    const detailed = instance.unwrap();
                    return detailed.owner.toHuman() === accountAddress;
                  });
                  return {
                    runningServices: runningServices.length,
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
                map((instances) => {
                  const deployedServices = instances.filter(([_, instance]) => {
                    if (instance.isNone) {
                      return false;
                    }
                    const detailed = instance.unwrap();
                    return detailed.owner.toHuman() === accountAddress;
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

        const pendingServices$ =
          apiRx.query.services?.serviceRequests === undefined
            ? of({})
            : apiRx.query.services?.serviceRequests.entries().pipe(
                map((serviceRequests) => {
                  const pendingServices = serviceRequests.filter(
                    ([_, serviceRequest]) => {
                      if (serviceRequest.isNone) {
                        return false;
                      }
                      const detailed = serviceRequest.unwrap();
                      return detailed.owner.toHuman() === accountAddress;
                    },
                  );
                  return {
                    pendingServices: pendingServices.length,
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

        const consumedServices$ =
          apiRx.query.services?.instances === undefined
            ? of({})
            : apiRx.query.services?.instances.entries().pipe(
                map((instances) => {
                  const consumedServices = instances.filter(([_, instance]) => {
                    if (instance.isNone) {
                      return false;
                    }
                    const detailed = instance.unwrap();
                    return detailed.permittedCallers.some(
                      (caller) => caller.toHuman() === accountAddress,
                    );
                  });
                  return {
                    consumedServices: consumedServices.length,
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
          runningServices$,
          deployedServices$,
          pendingServices$,
          consumedServices$,
        ]).pipe(
          map(
            ([
              runningServices,
              deployedServices,
              pendingServices,
              consumedServices,
            ]) => {
              return {
                ...runningServices,
                ...deployedServices,
                ...pendingServices,
                ...consumedServices,
              };
            },
          ),
          catchError((error) => {
            console.error('Error querying services with blueprints:', error);
            return of({});
          }),
        );
      },
      [accountAddress],
    ),
  );

  const result = useMemo(() => {
    const parsed = userStatsSchema.safeParse(userStats);
    if (!parsed.success) {
      console.error(parsed.error);
      return {
        runningServices: 0,
        deployedServices: 0,
        pendingServices: 0,
        consumedServices: 0,
      };
    }
    return parsed.data;
  }, [userStats]);

  return {
    result,
    ...rest,
  };
};
