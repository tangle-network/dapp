import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';

const getExplorerUrlByAddressByChains = (
  address: string,
  typedChainIds: number[],
): Record<number, string | undefined> => {
  return typedChainIds.reduce((map, typedChainId) => {
    const blockExplorerUrl =
      chainsConfig[typedChainId]?.blockExplorers?.default?.url;

    return {
      ...map,
      [typedChainId]: blockExplorerUrl
        ? getExplorerURI(
            blockExplorerUrl,
            address,
            'address',
            'web3',
          ).toString()
        : undefined,
    };
  }, {});
};

export default getExplorerUrlByAddressByChains;
