import { useMemo } from 'react';
import useOperatorConcentration from './useOperatorConcentration';
import useOperatorTvl, { OperatorTvlGroup } from './useOperatorTvl2';
import type { DelegatorInfo } from '../../types/restake';
import useRestakeAssets from './useRestakeAssets';
import { BN } from '@polkadot/util';
import useDelegatorTvl from './useDelegatorTVL';

export type RestakeTvlGroup = OperatorTvlGroup & {
  delegatorTvl: BN;
  totalDelegatorTvl: BN;
  totalNetworkTvl: BN;
};

const useRestakeTvl = (delegatorInfo: DelegatorInfo | null) => {
  const { assets } = useRestakeAssets();
  const { operatorTvl, vaultTvl, operatorTvlByAsset } = useOperatorTvl();

  const { delegatorTvl, totalDelegatorTvl } = useDelegatorTvl(
    delegatorInfo,
    assets,
  );

  const totalNetworkTvl = useMemo(() => {
    return Object.values(vaultTvl).reduce((sum, tvl) => sum + tvl, 0);
  }, [vaultTvl]);

  const operatorConcentration = useOperatorConcentration(
    operatorTvl,
    totalNetworkTvl,
  );

  return {
    delegatorTvl,
    operatorConcentration,
    operatorTvl,
    vaultTvl,
    totalDelegatorTvl,
    totalNetworkTvl,
    operatorTvlByAsset,
  };
};

export default useRestakeTvl;
