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

export const getExplorerURI = (
  explorerUri: string,
  addOrTxHash: string,
  variant: 'tx' | 'address',
  txProviderType: WebbProviderType
): URL => {
  switch (txProviderType) {
    case 'web3':
      return new URL(`${variant}/${addOrTxHash}`, explorerUri);

    case 'polkadot': {
      const path =
        variant === 'tx'
          ? `#/extrinsics/${addOrTxHash}`
          : `#/accounts/${
            typeof substrateExplorerAndChainIdMap[explorerUri] === 'number'
              ? encodeAddress(
                  addOrTxHash,
                  substrateExplorerAndChainIdMap[explorerUri]
                )
              : addOrTxHash
          }`;
      return new URL(`${path}`, explorerUri);
    }

    default:
      return new URL('');
  }
};

export default getExplorerURI;
