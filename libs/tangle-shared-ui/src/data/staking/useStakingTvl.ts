import { useMemo } from 'react';
import useOperatorConcentration from './useOperatorConcentration';
import useOperatorTvl, { OperatorTvlGroup } from './useOperatorTvl';
import type { DelegatorInfo } from '../../types/staking';
import useSubstrateStakingAssets from './useStakingAssets';
import { BN } from '@polkadot/util';
import useDelegatorTvl from './useDelegatorTVL';

export type StakingTvlGroup = OperatorTvlGroup & {
  delegatorTvl: BN;
  totalDelegatorTvl: BN;
  totalNetworkTvl: BN;
};

const useStakingTvl = (delegatorInfo: DelegatorInfo | null) => {
  const { assets } = useSubstrateStakingAssets();
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

export default useStakingTvl;
