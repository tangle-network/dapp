import { PalletRewardsRewardConfigForAssetVault } from '@polkadot/types/lookup';
import useApiRx from '../hooks/useApiRx';
import { useCallback, useMemo } from 'react';

const useRestakeRewardConfig = () => {
  const { result: entries } = useApiRx(
    useCallback((api) => {
      if (api.query.rewards?.rewardConfigStorage === undefined) {
        return null;
      }

      return api.query.rewards.rewardConfigStorage.entries();
    }, []),
  );

  const rewardConfigs = useMemo(() => {
    if (entries === null) {
      return null;
    }

    const map = new Map<number, PalletRewardsRewardConfigForAssetVault>();

    for (const [vaultId, configOpt] of entries) {
      if (configOpt.isNone) {
        continue;
      }

      map.set(vaultId.args[0].toNumber(), configOpt.unwrap());
    }

    return map;
  }, [entries]);

  return rewardConfigs;
};

export default useRestakeRewardConfig;
