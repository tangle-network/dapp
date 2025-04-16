import { assertSubstrateAddress } from '@tangle-network/ui-components';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { useMemo } from 'react';

export type OperatorConcentration = Map<SubstrateAddress, number | null>;

export function useOperatorConcentration(
  operatorTVL: Map<SubstrateAddress, number>,
  totalNetworkTVL: number,
) {
  return useMemo(() => {
    const operatorConcentration = Object.entries(operatorTVL).reduce(
      (acc, [operatorId_, operatorTVL]) => {
        const operatorId = assertSubstrateAddress(operatorId_);
        acc.set(
          operatorId,
          totalNetworkTVL > 0 ? (operatorTVL / totalNetworkTVL) * 100 : null,
        );

        return acc;
      },
      new Map<SubstrateAddress, number | null>(),
    );

    return operatorConcentration;
  }, [operatorTVL, totalNetworkTVL]);
}
