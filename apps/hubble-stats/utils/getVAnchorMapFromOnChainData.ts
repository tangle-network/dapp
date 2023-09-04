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
};

const getVAnchorMapFromOnChainData = (
  data: any,
  activeTypedChainIds: number[]
) => {
  return Object.keys(data)
    .filter((typedChainId) => activeTypedChainIds.includes(+typedChainId))
    .reduce((map, typedChainId) => {
      const onChainData = data[+typedChainId];
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

        if (!map[anchorAddress]) {
          const newVAnchor = {
            address: anchorAddress,
            poolType: 'single',
            fungibleTokenName: fungibleCurrency.name,
            fungibleTokenSymbol: fungibleCurrency.symbol,
            fungibleTokenAddress: fungibleCurrency.address,
            isNativeAllowed,
            signatureBridge,
            treasuryAddress,
            creationTimestamp,
            composition: wrappableCurrencies.map((token: any) => token.symbol),
            supportedChains: [+typedChainId],
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

          const updatedSupportedChains = [
            ...map[anchorAddress].supportedChains,
            +typedChainId,
          ];

          const updatedVAnchor = {
            ...map[anchorAddress],
            composition: [...updatedComposition],
            supportedChains: updatedSupportedChains,
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
