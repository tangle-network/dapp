import {
  type ContractAddresses,
  getContractsByChainId,
} from '@tangle-network/dapp-config/contracts';

export const getContractsForChain = (
  chainId: number,
): ContractAddresses | null => {
  try {
    return getContractsByChainId(chainId);
  } catch {
    return null;
  }
};

export default getContractsForChain;
