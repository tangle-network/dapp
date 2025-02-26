import { isTemplateBigInt } from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import merge from 'lodash/merge';
import { useCallback, useMemo } from 'react';
import useRestakeAssetIds from './useRestakeAssetIds';
import { RestakeAssetId } from '../../types';
import useErc20Balances from './useErc20Balances';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { map } from 'rxjs';
import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';

const useRestakeAssetBalances = () => {
  const substrateAddress = useSubstrateAddress();
  const assetIds = useRestakeAssetIds();

  const { evmAssetIds, substrateAssetIds } = useMemo(() => {
    if (assetIds === null) {
      return {
        substrateAssetIds: [],
        evmAssetIds: [],
      };
    }

    const { evm, substrate } = assetIds.reduce(
      (acc, assetId) => {
        if (isTemplateBigInt(assetId)) {
          acc.substrate.add(assetId);
        } else if (isEvmAddress(assetId)) {
          acc.evm.add(assetId);
        }

        return acc;
      },
      {
        substrate: new Set<`${bigint}`>(),
        evm: new Set<EvmAddress>(),
      },
    );

    return {
      evmAssetIds: Array.from(evm),
      substrateAssetIds: Array.from(substrate),
    };
  }, [assetIds]);

  const { data: erc20Balances, refetch: refetchErc20Balances } =
    useErc20Balances(evmAssetIds);

  const { result: assetAccounts } = useApiRx(
    useCallback(
      (api) => {
        if (substrateAddress === null || substrateAssetIds === null) {
          return null;
        }

        const queries = substrateAssetIds.map(
          (assetId) => [assetId, substrateAddress] as const,
        );

        return api.query.assets.account.multi(queries).pipe(
          map((accounts) => {
            type AssetAccount = {
              assetId: RestakeAssetId;
              account: PalletAssetsAssetAccount;
            };

            const result: AssetAccount[] = [];

            for (const [index, account] of accounts.entries()) {
              if (account.isSome) {
                result.push({
                  assetId: substrateAssetIds[index],
                  account: account.unwrap(),
                });
              }
            }

            return result;
          }),
        );
      },
      [substrateAddress, substrateAssetIds],
    ),
  );

  const balances = useMemo(() => {
    const evmBalances = erc20Balances?.reduce((acc, balance, idx) => {
      if (balance.status === 'success' && typeof balance.result === 'bigint') {
        const id = evmAssetIds[idx];

        // TODO: Scale bigint to BN using appropriate decimals?
        acc.set(id, new BN(balance.result.toString()));
      }

      return acc;
    }, new Map<RestakeAssetId, BN>());

    const substrateBalances = assetAccounts?.reduce(
      (acc, { assetId, account }) => {
        acc.set(assetId, account.balance.toBn());

        return acc;
      },
      new Map<RestakeAssetId, BN>(),
    );

    return merge(evmBalances, substrateBalances);
  }, [assetAccounts, erc20Balances, evmAssetIds]);

  return {
    balances,
    refetchErc20Balances,
  };
};

export default useRestakeAssetBalances;
