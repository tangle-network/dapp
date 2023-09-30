import onChainDataJson from '@webb-tools/api-provider-environment/generated/on-chain-config.json';
import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { SubgraphUrlType } from '../types';
import { PoolType } from '../components/PoolTypeChip/types';

import { ACTIVE_SUBGRAPH_MAP } from './subgraphs';

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
  supportedSubgraphs: SubgraphUrlType[];
  nativeTokenByChain: Record<PresetTypedChainId, string>;
  wrappableTokensByChain: Record<PresetTypedChainId, string[]>;
};

const activeChains = Object.keys(ACTIVE_SUBGRAPH_MAP).map(
  (typedChainedId) => +typedChainedId
);

export const VANCHORS_MAP = Object.keys(onChainDataJson)
  .filter((typedChainId) => activeChains.includes(+typedChainId))
  .reduce((map, typedChainId) => {
    const onChainData =
      onChainDataJson[typedChainId as keyof typeof onChainDataJson];
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
          supportedSubgraphs: [ACTIVE_SUBGRAPH_MAP[+typedChainId]],
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

        const updatedSupportedSubgraphs = [
          ...map[anchorAddress].supportedSubgraphs,
          ACTIVE_SUBGRAPH_MAP[+typedChainId],
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
          supportedSubgraphs: updatedSupportedSubgraphs,
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

export const VANCHOR_ADDRESSES = Object.keys(VANCHORS_MAP);
