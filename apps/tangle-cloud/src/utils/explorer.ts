import { chainsConfig } from '@tangle-network/dapp-config/chains';
import {
  TANGLE_MAINNET_EVM_EXPLORER_URL,
  TANGLE_TESTNET_EVM_EXPLORER_URL,
} from '@tangle-network/dapp-config/constants';
import EVMChainId from '@tangle-network/dapp-types/EVMChainId';

const LOCAL_EVM_CHAIN_IDS = new Set<number>([
  EVMChainId.AnvilLocal,
  EVMChainId.TangleLocalEVM,
  EVMChainId.HermesLocalnet,
  EVMChainId.AthenaLocalnet,
  EVMChainId.DemeterLocalnet,
]);

export const getActiveChainConfig = (chainId: number) =>
  chainsConfig[chainId] ??
  Object.values(chainsConfig).find((chain) => chain.id === chainId);

export const getTxExplorerUrl = (chainId: number): string | undefined => {
  const chainExplorerUrl = getActiveChainConfig(chainId)?.blockExplorers?.default?.url;
  if (chainExplorerUrl) {
    return chainExplorerUrl;
  }

  if (chainId === EVMChainId.TangleMainnetEVM) {
    return TANGLE_MAINNET_EVM_EXPLORER_URL;
  }

  if (chainId === EVMChainId.TangleTestnetEVM) {
    return TANGLE_TESTNET_EVM_EXPLORER_URL;
  }

  return undefined;
};

export const isNonLocalEvmChain = (chainId: number): boolean =>
  !LOCAL_EVM_CHAIN_IDS.has(chainId);
