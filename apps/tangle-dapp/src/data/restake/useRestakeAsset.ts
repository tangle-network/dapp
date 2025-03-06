import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import { useCallback, useMemo } from 'react';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import useStakingLedger from '../staking/useStakingLedger';

const useRestakeAsset = (id: RestakeAssetId | null | undefined) => {
  const { assets } = useRestakeAssets();
  const { nativeTokenSymbol } = useNetworkStore();

  const { result: bondedInStaking } = useStakingLedger(
    useCallback((ledger) => ledger.active.toBn(), []),
  );

  const asset = useMemo<RestakeAsset | null>(() => {
    if (id === null || id === undefined || assets === null) {
      return null;
    }
    // Special case for the native asset, which is used for native
    // restaking.
    else if (
      id === NATIVE_ASSET_ID &&
      bondedInStaking?.value !== null &&
      bondedInStaking?.value !== undefined &&
      !bondedInStaking.value.isZero()
    ) {
      return {
        id: NATIVE_ASSET_ID,
        balance: bondedInStaking.value,
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
  }, [assets, bondedInStaking, id, nativeTokenSymbol]);

  return asset;
};

export default useRestakeAsset;
