import { BN, BN_ZERO } from '@polkadot/util';
import { useRestakeContext } from '@tangle-network/tangle-shared-ui/context/RestakeContext';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import { useMemo } from 'react';

const useRestakeAsset = (id: RestakeAssetId | null | undefined) => {
  const { assets, balances } = useRestakeContext();

  const asset = useMemo<RestakeAsset | null>(() => {
    if (id === null || id === undefined) {
      return null;
    }

    const metadata = assets[id];

    if (metadata === undefined) {
      return null;
    }

    const balanceBigInt = balances[id]?.balance;

    const balanceBn =
      balanceBigInt !== undefined ? new BN(balanceBigInt.toString()) : BN_ZERO;

    return {
      id,
      name: metadata.name,
      symbol: metadata.symbol,
      decimals: metadata.decimals,
      balance: balanceBn,
    } satisfies RestakeAsset;
  }, [assets, balances, id]);

  return asset;
};

export default useRestakeAsset;
