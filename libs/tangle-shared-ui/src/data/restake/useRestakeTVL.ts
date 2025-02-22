import { useMemo } from 'react';
import { useRestakeContext } from '../../context/RestakeContext';
import { useDelegatorTVL } from '../../data/restake/useDelegatorTVL';
import { useOperatorConcentration } from '../../data/restake/useOperatorConcentration';
import { useOperatorTVL } from '../../data/restake/useOperatorTVL';
import type { DelegatorInfo, OperatorMap } from '../../types/restake';

const useRestakeTVL = (
  operatorMap: OperatorMap,
  delegatorInfo: DelegatorInfo | null,
) => {
  const { assets } = useRestakeContext();
  const { operatorTVL, vaultTVL } = useOperatorTVL(operatorMap, assets);

  const { delegatorTVL, totalDelegatorTVL } = useDelegatorTVL(
    delegatorInfo,
    assets,
  );

  const totalNetworkTVL = useMemo(() => {
    return Object.values(vaultTVL).reduce((sum, tvl) => sum + tvl, 0);
  }, [vaultTVL]);

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
};

export default useRestakeTVL;
