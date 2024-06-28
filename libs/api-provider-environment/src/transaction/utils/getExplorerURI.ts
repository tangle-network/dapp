import { encodeAddress } from '@polkadot/util-crypto';
import { WebbProviderType } from '@webb-tools/abstract-api-provider/types';
import { chainsConfig as substrateChainsConfig } from '@webb-tools/dapp-config/chains/substrate';

/**
 * Check if the provided explorer uri is
 * the Polkadot Portal or not.
 *
 * @param explorerUri the explorer uri to check.
 * @returns a flag indicates that the explorer uri
 * is the Polkadot Portal or not.
 */
export function isPolkadotPortal(explorerUri = ''): boolean {
  return explorerUri.includes('polkadot.js.org/apps');
}

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

export const getExplorerURI = (
  explorerUri: string,
  pathOrHash: string,
  variant: ExplorerVariant,
  txProviderType: WebbProviderType,
  isPolkadotPortal?: boolean,
): URL => {
  switch (txProviderType) {
    case 'web3':
      return new URL(`${variant}/${pathOrHash}`, explorerUri);

    case 'polkadot': {
      const path = getPolkadotPath(
        variant,
        explorerUri,
        pathOrHash,
        isPolkadotPortal,
      );

      return new URL(path, explorerUri);
    }
  }
};

export default getExplorerURI;

/**
 * @internal
 */
function getPolkadotPath(
  variant: ExplorerVariant,
  explorerUri: string,
  pathOrHash: string,
  isPolkadotPortalArg?: boolean,
) {
  if (variant === 'tx') {
    return `#/extrinsics/${pathOrHash}`;
  }

  if (variant === 'address') {
    // encode address for all available substrate chains
    const encodedAddress =
      typeof substrateExplorerAndChainIdMap[explorerUri] === 'number'
        ? encodeAddress(pathOrHash, substrateExplorerAndChainIdMap[explorerUri])
        : pathOrHash;

    return `#/accounts/${encodedAddress}`;
  }

  const isPolkaPortal =
    typeof isPolkadotPortalArg === 'boolean'
      ? isPolkadotPortalArg
      : isPolkadotPortal(explorerUri);

  if (!isPolkaPortal) {
    return `#/blocks/${pathOrHash}`;
  }

  return `#/explorer/query/${pathOrHash}`;
}
