import { useMemo } from 'react';
import { useDelegatorTVL } from '../../data/restake/useDelegatorTVL';
import useOperatorConcentration from '../../data/restake/useOperatorConcentration';
import {
  OperatorTVLType,
  useOperatorTVL,
} from '../../data/restake/useOperatorTVL';
import type { DelegatorInfo, OperatorMap } from '../../types/restake';
import useRestakeAssets from './useRestakeAssets';
import { BN } from '@polkadot/util';

export type RestakeTVLType = OperatorTVLType & {
  delegatorTVL: BN;
  totalDelegatorTVL: BN;
  totalNetworkTVL: BN;
};

const useRestakeTVL = (
  operatorMap: OperatorMap,
  delegatorInfo: DelegatorInfo | null,
) => {
  const { assets } = useRestakeAssets();

  const { operatorTVL, vaultTVL, operatorTVLByAsset } = useOperatorTVL(
    operatorMap,
    assets,
  );

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
    operatorTVLByAsset,
  };
};

export default useRestakeTVL;
