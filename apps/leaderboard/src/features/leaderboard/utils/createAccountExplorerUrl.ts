import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';

// EVM block explorer URLs for Tangle networks
const MAINNET_EXPLORER = 'https://explorer.tangle.tools';
const TESTNET_EXPLORER = 'https://testnet-explorer.tangle.tools';

export const createAccountExplorerUrl = (
  address: string,
  network: NetworkType,
): string => {
  const baseUrl = network === 'MAINNET' ? MAINNET_EXPLORER : TESTNET_EXPLORER;
  return `${baseUrl}/address/${address}`;
};
