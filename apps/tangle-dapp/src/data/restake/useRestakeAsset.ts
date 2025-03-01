import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import { useMemo } from 'react';
import useBalancesLock from '../balances/useBalancesLock';
import { SubstrateLockId } from '../../constants';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';

const useRestakeAsset = (id: RestakeAssetId | null | undefined) => {
  const { assets } = useRestakeAssets();
  const stakingLock = useBalancesLock(SubstrateLockId.STAKING);
  const { nativeTokenSymbol } = useNetworkStore();

  const asset = useMemo<RestakeAsset | null>(() => {
    if (id === null || id === undefined || assets === null) {
      return null;
    }
    // Special case for the native asset, which is used for native
    // restaking.
    else if (
      id === NATIVE_ASSET_ID &&
      stakingLock.amount !== null &&
      !stakingLock.amount.isZero()
    ) {
      return {
        id: NATIVE_ASSET_ID,
        balance: stakingLock.amount,
        metadata: {
          decimals: TANGLE_TOKEN_DECIMALS,
          symbol: nativeTokenSymbol,
          status: 'Live',
          assetId: NATIVE_ASSET_ID,
          vaultId: null,
          // TODO: Implement token price fetching.
          priceInUsd: null,
        },
      } satisfies RestakeAsset;
    }

    return assets.get(id) ?? null;
  }, [assets, id, nativeTokenSymbol, stakingLock.amount]);

  return asset;
};

export default useRestakeAsset;
