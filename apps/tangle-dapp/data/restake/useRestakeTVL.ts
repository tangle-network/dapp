import { useRestakeContext } from '../../context/RestakeContext';
import type { DelegatorInfo, OperatorMap } from '../../types/restake';
import { useDelegatorTVL } from './useDelegatorTVL';
import { useOperatorConcentration } from './useOperatorConcentration';
import { useOperatorTVL } from './useOperatorTVL';

export default function useRestakeTVL(
  operatorMap: OperatorMap,
  delegatorInfo: DelegatorInfo | null,
) {
  const { assetMap } = useRestakeContext();

  const { operatorTVL, poolTVL } = useOperatorTVL(operatorMap, assetMap);

  const { delegatorTVL, totalDelegatorTVL } = useDelegatorTVL(
    delegatorInfo,
    assetMap,
  );

  const totalNetworkTVL = Object.values(poolTVL).reduce(
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
    poolTVL,
    totalDelegatorTVL,
    totalNetworkTVL,
  };
}
