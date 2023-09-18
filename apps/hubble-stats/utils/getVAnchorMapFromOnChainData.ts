import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { PoolType } from '../components/PoolTypeChip/types';

// TODO: update comments
type VAnchorType = {
  address: string;
  poolType: PoolType;
  fungibleTokenName: string;
  fungibleTokenSymbol: string;
  fungibleTokenAddress: string;
  isNativeAllowed: boolean;
  signatureBridge: string;
  treasuryAddress: string;
  creationTimestamp: number;
  composition: string[];
  supportedChains: PresetTypedChainId[];
  nativeTokenByChain: Record<PresetTypedChainId, string>;
  wrappableTokensByChain: Record<PresetTypedChainId, string[]>;
};

const getVAnchorMapFromOnChainData = (
  data: any,
  activeTypedChainIds: number[]
) => {
  return Object.keys(data)
    .filter((typedChainId) => activeTypedChainIds.includes(+typedChainId))
    .reduce((map, typedChainId) => {
      const onChainData = data[+typedChainId];
      const nativeCurrency = onChainData.nativeCurrency;
      const anchorMetadatas = onChainData.anchorMetadatas;
      let updatedMap = map;

      for (const anchorMetadata of anchorMetadatas) {
        const {
          address: anchorAddress,
          fungibleCurrency,
          wrappableCurrencies,
          isNativeAllowed,
          signatureBridge,
          treasuryAddress,
          creationTimestamp,
        } = anchorMetadata;

        const wrappableTokens = wrappableCurrencies.map(
          (token: any) => token.symbol
        );

        if (!map[anchorAddress]) {
          const newVAnchor = {
            address: anchorAddress,
            poolType: 'single',
            nativeTokenName: nativeCurrency.name,
            nativeTokenSymbol: nativeCurrency.symbol,
            fungibleTokenName: fungibleCurrency.name,
            fungibleTokenSymbol: fungibleCurrency.symbol,
            fungibleTokenAddress: fungibleCurrency.address,
            isNativeAllowed,
            signatureBridge,
            treasuryAddress,
            creationTimestamp,
            composition: isNativeAllowed
              ? [...wrappableTokens, nativeCurrency.symbol]
              : wrappableTokens,
            supportedChains: [+typedChainId],
            nativeTokenByChain: {
              [+typedChainId]: nativeCurrency.symbol,
            },
            wrappableTokensByChain: {
              [+typedChainId]: wrappableTokens,
            },
          } as VAnchorType;
          updatedMap = {
            ...updatedMap,
            [anchorAddress]: newVAnchor,
          };
        } else {
          const updatedComposition = new Set(map[anchorAddress].composition);
          for (const token of wrappableCurrencies) {
            updatedComposition.add(token.symbol);
          }

          if (isNativeAllowed) {
            updatedComposition.add(nativeCurrency.symbol);
          }

          const updatedSupportedChains = [
            ...map[anchorAddress].supportedChains,
            +typedChainId,
          ];

          const updatedNativeTokenByChain = {
            ...map[anchorAddress].nativeTokenByChain,
            [+typedChainId]: nativeCurrency.symbol,
          };

          const updatedWrappableTokensByChain = {
            ...map[anchorAddress].wrappableTokensByChain,
            [+typedChainId]: wrappableTokens,
          };

          const updatedVAnchor = {
            ...map[anchorAddress],
            composition: [...updatedComposition],
            supportedChains: updatedSupportedChains,
            nativeTokenByChain: updatedNativeTokenByChain,
            wrappableTokensByChain: updatedWrappableTokensByChain,
          } as VAnchorType;

          updatedMap = {
            ...updatedMap,
            [anchorAddress]: updatedVAnchor,
          };
        }
      }

      return updatedMap;
    }, {} as Record<string, VAnchorType>);
};

export default getVAnchorMapFromOnChainData;
