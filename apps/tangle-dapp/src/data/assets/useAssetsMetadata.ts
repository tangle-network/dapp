import { hexToString } from '@polkadot/util';
import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import { RestakeVaultAssetMetadata } from '@webb-tools/tangle-shared-ui/types/restake';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { isEvmAddress } from '@webb-tools/webb-ui-components/utils/isEvmAddress20';
import { isTemplateBigInt } from '@webb-tools/webb-ui-components/utils/isTemplateBigInt';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';

type AssetMetadata = Pick<
  RestakeVaultAssetMetadata,
  'name' | 'symbol' | 'decimals'
>;

export default function useAssetsMetadata(assetIds: RestakeAssetId[]) {
  const substrateAssetIds = useMemo(
    () => assetIds.filter((id) => isTemplateBigInt(id)),
    [assetIds],
  );

  const evmAssetIds = useMemo(
    () => assetIds.filter((id) => isEvmAddress(id)),
    [assetIds],
  );

  const {
    result: substrateAssetMetadata,
    isLoading: isSubstrateLoading,
    error: substrateError,
  } = useApiRx(
    useCallback(
      (apiRx) => {
        if (apiRx.query.assets?.metadata?.multi === undefined) {
          return null;
        }

        return apiRx.query.assets.metadata.multi(substrateAssetIds).pipe(
          map((result) =>
            result.map((metadata) => ({
              name: hexToString(metadata.name.toHex()),
              symbol: hexToString(metadata.symbol.toHex()),
              decimals: metadata.decimals.toNumber(),
            })),
          ),
        );
      },
      [substrateAssetIds],
    ),
  );

  const {
    data: evmAssetNames,
    isLoading: isEvmLoading,
    error: evmError,
  } = useReadContracts({
    contracts: evmAssetIds.map((assetId) => ({
      abi: erc20Abi,
      address: assetId,
      functionName: 'name',
    })),
  });

  const {
    data: evmAssetDecimals,
    isLoading: isEvmDecimalsLoading,
    error: evmDecimalsError,
  } = useReadContracts(
    useMemo(
      () =>
        ({
          contracts: evmAssetIds.map(
            (assetId) =>
              ({
                abi: erc20Abi,
                address: assetId,
                functionName: 'decimals',
              }) as const,
          ),
        }) as const,
      [evmAssetIds],
    ),
  );

  const {
    data: evmAssetSymbols,
    isLoading: isEvmSymbolsLoading,
    error: evmSymbolsError,
  } = useReadContracts(
    useMemo(
      () => ({
        contracts: evmAssetIds.map((assetId) => ({
          abi: erc20Abi,
          address: assetId,
          functionName: 'symbol',
        })),
      }),
      [evmAssetIds],
    ),
  );

  // Aggregate the results
  const substrateDecimalsMap = useMemo(() => {
    const initialMap = new Map<`${bigint}`, AssetMetadata>();

    if (substrateAssetMetadata === null) {
      return initialMap;
    }

    return substrateAssetMetadata.reduce((acc, assetMetadata, idx) => {
      if (assetMetadata.decimals === 0) {
        return acc;
      }

      acc.set(substrateAssetIds[idx], assetMetadata);

      return acc;
    }, initialMap);
  }, [substrateAssetIds, substrateAssetMetadata]);

  const evmDecimalsMap = useMemo(() => {
    const initialMap = new Map<EvmAddress, AssetMetadata>();

    if (evmAssetDecimals === undefined) {
      return initialMap;
    }

    if (evmAssetNames === undefined || evmAssetSymbols === undefined) {
      return initialMap;
    }

    return evmAssetDecimals.reduce((acc, decimalsResult, idx) => {
      const nameResult = evmAssetNames[idx];
      const symbolResult = evmAssetSymbols[idx];

      if (nameResult.status === 'failure') {
        return acc;
      }

      if (symbolResult.status === 'failure') {
        return acc;
      }

      if (decimalsResult.status === 'failure') {
        return acc;
      }

      const name = nameResult.result as string;
      const symbol = symbolResult.result as string;
      const decimals = decimalsResult.result as number;

      acc.set(evmAssetIds[idx], { name, symbol, decimals });

      return acc;
    }, initialMap);
  }, [evmAssetDecimals, evmAssetNames, evmAssetSymbols, evmAssetIds]);

  const result = useMemo(
    () =>
      new Map<RestakeAssetId, AssetMetadata>([
        ...substrateDecimalsMap,
        ...evmDecimalsMap,
      ]),
    [evmDecimalsMap, substrateDecimalsMap],
  );

  return {
    result,
    isLoading:
      isSubstrateLoading ||
      isEvmLoading ||
      isEvmDecimalsLoading ||
      isEvmSymbolsLoading,
    error: substrateError || evmError || evmDecimalsError || evmSymbolsError,
  };
}
