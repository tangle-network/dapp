import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { RestakeAsset } from '@webb-tools/tangle-shared-ui/types/restake';
import { isEvmAddress } from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';
import { BN, BN_ZERO } from '@polkadot/util';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import useTangleEvmErc20Balances from '@webb-tools/tangle-shared-ui/hooks/useTangleEvmErc20Balances';

const useRestakeAsset = (id: RestakeAssetId | null | undefined) => {
  const { vaults, balances } = useRestakeContext();
  const { data: erc20Balances } = useTangleEvmErc20Balances();

  const asset = useMemo<RestakeAsset | null>(() => {
    if (id === null || id === undefined) {
      return null;
    } else if (isEvmAddress(id)) {
      if (erc20Balances === null || erc20Balances === undefined) {
        return null;
      }

      const erc20Asset = erc20Balances.find(
        (asset) => asset.contractAddress === id,
      );

      if (erc20Asset === undefined) {
        return null;
      }

      return {
        ...erc20Asset,
        id,
      } satisfies RestakeAsset;
    }

    const metadata = vaults[id];

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
  }, [vaults, balances, erc20Balances, id]);

  return asset;
};

export default useRestakeAsset;
