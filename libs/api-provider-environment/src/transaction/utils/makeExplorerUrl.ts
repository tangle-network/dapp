import { encodeAddress } from '@polkadot/util-crypto';
import { WebbProviderType } from '@webb-tools/abstract-api-provider/types';
import { chainsConfig as substrateChainsConfig } from '@webb-tools/dapp-config/chains/substrate';

export const isPolkadotJsDashboard = (explorerUrl: string): boolean => {
  return explorerUrl.includes('polkadot.js.org/apps');
};

const SUBSTRATE_EXPLORER_AND_CHAIN_ID_MAP = Object.keys(
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

const makeSubstrateExplorerPath = (
  variant: ExplorerVariant,
  explorerUri: string,
  pathOrHash: string,
): string => {
  // PolkadotJS explorer cannot link to a transaction directly.
  // Instead, link to the block details, which contains the transaction.
  if (variant === 'tx') {
    return `#/explorer/query/${pathOrHash}`;
  } else if (variant === 'address') {
    // Encode address for all available substrate chains.
    const encodedAddress =
      typeof SUBSTRATE_EXPLORER_AND_CHAIN_ID_MAP[explorerUri] === 'number'
        ? encodeAddress(
            pathOrHash,
            SUBSTRATE_EXPLORER_AND_CHAIN_ID_MAP[explorerUri],
          )
        : pathOrHash;

    return `#/accounts/${encodedAddress}`;
  }

  // If the explorer is PolkadotJS, use the explorer query path,
  // which links to block details. Otherwise, default to Statescan.
  return isPolkadotJsDashboard(explorerUri)
    ? `#/explorer/query/${pathOrHash}`
    : `#/blocks/${pathOrHash}`;
};

export const makeExplorerUrl = (
  baseUrl: string,
  pathOrHash: string,
  variant: ExplorerVariant,
  environment: WebbProviderType,
): string => {
  switch (environment) {
    case 'web3':
      return new URL(`${variant}/${pathOrHash}`, baseUrl).toString();

    case 'polkadot': {
      const path = makeSubstrateExplorerPath(variant, baseUrl, pathOrHash);

      return new URL(path, baseUrl).toString();
    }
  }
};

export default makeExplorerUrl;
