import { encodeAddress } from '@polkadot/util-crypto';
import { WebbProviderType } from '@webb-tools/abstract-api-provider/types';
import { chainsConfig as substrateChainsConfig } from '@webb-tools/dapp-config/chains/substrate';

const substrateExplorerAndChainIdMap = Object.keys(
  substrateChainsConfig
).reduce((acc, key) => {
  const url = substrateChainsConfig[Number(key)].blockExplorers?.default.url;
  if (url) {
    acc[url] = substrateChainsConfig[Number(key)].id;
  }
  return acc;
}, {} as Record<string, number>);

export type ExplorerVariant = 'tx' | 'address';

export const getExplorerURI = (
  explorerUri: string,
  pathOrTxHash: string,
  variant: ExplorerVariant,
  txProviderType: WebbProviderType
): URL => {
  switch (txProviderType) {
    case 'web3':
      return new URL(`${variant}/${pathOrTxHash}`, explorerUri);

    case 'polkadot': {
      const path =
        variant === 'tx'
          ? `#/extrinsics/${pathOrTxHash}`
          : `#/accounts/${
              // encode address for all available substrate chains
              typeof substrateExplorerAndChainIdMap[explorerUri] === 'number'
                ? encodeAddress(
                    pathOrTxHash,
                    substrateExplorerAndChainIdMap[explorerUri]
                  )
                : pathOrTxHash
            }`;

      return new URL(path, explorerUri);
    }
  }
};

export default getExplorerURI;
