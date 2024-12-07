import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';

export function useOperatorConcentration(
  operatorTVL: Record<string, number>,
  totalNetworkTVL: number,
) {
  const concentration$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([operatorTVL, totalNetworkTVL]) => {
          const operatorConcentration = Object.entries(operatorTVL).reduce(
            (acc, [operatorId, operatorTVL]) => {
              acc[operatorId] =
                totalNetworkTVL > 0
                  ? (operatorTVL / totalNetworkTVL) * 100
                  : null;
              return acc;
            },
            {} as Record<string, number | null>,
          );

          return of(operatorConcentration);
        }),
      ),
    [operatorTVL, totalNetworkTVL],
  );

  return useObservableState(concentration$, {});
}
