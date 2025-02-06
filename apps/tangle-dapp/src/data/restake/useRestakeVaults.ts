import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import useRestakeRewardConfig from './useRestakeRewardConfig';
import { useMemo } from 'react';
import calculateVaults, { VaultType } from '../../utils/calculateVaults';
import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeTVL from '@webb-tools/tangle-shared-ui/data/restake/useRestakeTVL';

type UseRestakeVaultsReturn<T extends boolean> = T extends true
  ? VaultType[]
  : Map<number, VaultType>;

const useRestakeVaults = <T extends boolean>(
  asArray: T,
): UseRestakeVaultsReturn<T> => {
  const { assets: assetsMetadataMap } = useRestakeContext();
  const rewardConfig = useRestakeRewardConfig();

  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();

  const { vaultTVL } = useRestakeTVL(operatorMap, delegatorInfo);

  const vaults = useMemo(
    () =>
      calculateVaults({
        assets: Object.values(assetsMetadataMap),
        rewardConfig,
        vaultTVL,
      }),
    [assetsMetadataMap, rewardConfig, vaultTVL],
  );

  return (
    asArray ? vaults.values().toArray() : vaults
  ) as UseRestakeVaultsReturn<T>;
};

export default useRestakeVaults;
