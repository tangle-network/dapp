import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { isTemplateBigInt } from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { RestakeAssetId } from '../../types';
import { TangleError, TangleErrorCode } from '../../types/error';
import useErc20Balances from './useErc20Balances';
import useRestakeAssetIds from './useRestakeAssetIds';

const useRestakeAssetBalances = () => {
  const substrateAddress = useSubstrateAddress();
  const { assetIds, isLoading: isLoadingAssetIds } = useRestakeAssetIds();

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

  const {
    data: erc20Balances,
    refetch: refetchErc20Balances,
    isPending: isLoadingErc20Balances,
  } = useErc20Balances(evmAssetIds);

  const { result: assetAccounts, isLoading: isLoadingAssetAccounts } = useApiRx(
    useCallback(
      (api) => {
        if (substrateAddress === null) {
          return new TangleError(TangleErrorCode.NO_ACTIVE_ACCOUNT);
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
    const balances = new Map<RestakeAssetId, BN>();

    if (erc20Balances !== undefined) {
      for (const [index, entry] of erc20Balances.entries()) {
        if (entry.status === 'success' && typeof entry.result === 'bigint') {
          const id = evmAssetIds.at(index);

          if (id !== undefined) {
            balances.set(id, new BN(entry.result.toString()));
          }
        }
      }
    }

    if (assetAccounts !== null) {
      for (const { assetId, account } of assetAccounts) {
        if (!balances.has(assetId)) {
          balances.set(assetId, account.balance.toBn());
        }
      }
    }

    return balances;
  }, [assetAccounts, erc20Balances, evmAssetIds]);

  return {
    balances,
    refetchErc20Balances,
    isLoading:
      isLoadingErc20Balances || isLoadingAssetAccounts || isLoadingAssetIds,
  };
};

export default useRestakeAssetBalances;
