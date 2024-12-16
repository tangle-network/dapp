import { useRestakeContext } from '../../context/RestakeContext';
import { useDelegatorTVL } from '../../data/restake/useDelegatorTVL';
import { useOperatorConcentration } from '../../data/restake/useOperatorConcentration';
import { useOperatorTVL } from '../../data/restake/useOperatorTVL';
import type { DelegatorInfo, OperatorMap } from '../../types/restake';

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
