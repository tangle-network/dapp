import { assertSubstrateAddress } from '@tangle-network/ui-components';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { useObservable, useObservableState } from 'observable-hooks';
import { of, switchMap } from 'rxjs';

export type OperatorConcentration = Map<SubstrateAddress, number | null>;

export function useOperatorConcentration(
  operatorTVL: Map<SubstrateAddress, number>,
  totalNetworkTVL: number,
) {
  const concentration$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([operatorTVL, totalNetworkTVL]) => {
          const operatorConcentration = Object.entries(operatorTVL).reduce(
            (acc, [operatorId_, operatorTVL]) => {
              const operatorId = assertSubstrateAddress(operatorId_);
              acc.set(
                operatorId,
                totalNetworkTVL > 0
                  ? (operatorTVL / totalNetworkTVL) * 100
                  : null,
              );

              return acc;
            },
            new Map<SubstrateAddress, number | null>(),
          );

          return of<OperatorConcentration>(operatorConcentration);
        }),
      ),
    [operatorTVL, totalNetworkTVL],
  );

  return useObservableState(concentration$, new Map());
}
