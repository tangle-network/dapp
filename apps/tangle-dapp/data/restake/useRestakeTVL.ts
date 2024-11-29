import { useOperatorTVL } from '@webb-tools/tangle-shared-ui/data/restake/useOperatorTVL';
import type { OperatorMap } from '@webb-tools/tangle-shared-ui/types/restake';
import type { DelegatorInfo } from '@webb-tools/tangle-shared-ui/types/restake';

import { useRestakeContext } from '../../context/RestakeContext';
import { useDelegatorTVL } from './useDelegatorTVL';
import { useOperatorConcentration } from './useOperatorConcentration';

export default function useRestakeTVL(
  operatorMap: OperatorMap,
  delegatorInfo: DelegatorInfo | null,
) {
  const { assetMap } = useRestakeContext();

  const { operatorTVL, vaultTVL } = useOperatorTVL(operatorMap, assetMap);

  const { delegatorTVL, totalDelegatorTVL } = useDelegatorTVL(
    delegatorInfo,
    assetMap,
  );

  const totalNetworkTVL = Object.values(vaultTVL).reduce(
    (sum, tvl) => sum + tvl,
    0,
  );

  const operatorConcentration = useOperatorConcentration(
    operatorTVL,
    totalNetworkTVL,
  );

  return {
    delegatorTVL,
    operatorConcentration,
    operatorTVL,
    vaultTVL,
    totalDelegatorTVL,
    totalNetworkTVL,
  };
}
