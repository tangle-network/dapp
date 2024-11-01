import { encodeAddress } from '@polkadot/util-crypto';
import { WebbProviderType } from '@webb-tools/abstract-api-provider/types';
import { chainsConfig as substrateChainsConfig } from '@webb-tools/dapp-config/chains/substrate';

export const isPolkadotJsDashboard = (explorerUrl: string): boolean => {
  return explorerUrl.includes('polkadot.js.org/apps');
};

const substrateExplorerAndChainIdMap = Object.keys(
  substrateChainsConfig,
).reduce(
  (acc, key) => {
    const url = substrateChainsConfig[Number(key)].blockExplorers?.default.url;

    if (url) {
      acc[url] = substrateChainsConfig[Number(key)].id;
    }

    return acc;
  },
  {} as Record<string, number>,
);

export type ExplorerVariant = 'tx' | 'address' | 'block';

export const getExplorerUrl = (
  baseUrl: string,
  pathOrHash: string,
  variant: ExplorerVariant,
  environment: WebbProviderType,
): URL => {
  switch (environment) {
    case 'web3':
      return new URL(`${variant}/${pathOrHash}`, baseUrl);

    case 'polkadot': {
      const path = getSubstrateExplorerPath(variant, baseUrl, pathOrHash);

      return new URL(path, baseUrl);
    }
  }
};

const getSubstrateExplorerPath = (
  variant: ExplorerVariant,
  explorerUri: string,
  pathOrHash: string,
) => {
  // PolkadotJS explorer cannot link to a transaction directly.
  // Instead, link to the block details, which contains the transaction.
  if (variant === 'tx') {
    return `#/explorer/query/${pathOrHash}`;
  } else if (variant === 'address') {
    // Encode address for all available substrate chains.
    const encodedAddress =
      typeof substrateExplorerAndChainIdMap[explorerUri] === 'number'
        ? encodeAddress(pathOrHash, substrateExplorerAndChainIdMap[explorerUri])
        : pathOrHash;

    return `#/accounts/${encodedAddress}`;
  }

  // If the explorer is PolkadotJS, use the explorer query path,
  // which links to block details. Otherwise, default to Statescan.
  return isPolkadotJsDashboard(explorerUri)
    ? `#/explorer/query/${pathOrHash}`
    : `#/blocks/${pathOrHash}`;
};

export default getExplorerUrl;
