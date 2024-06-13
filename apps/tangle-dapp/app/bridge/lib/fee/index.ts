import Decimal from 'decimal.js';
import { ethers } from 'ethers';

export const getEthersGasPrice = async (params?: {
  provider: ethers.providers.BaseProvider;
}) => {
  if (!params) return null;
  const { provider } = params;
  return new Decimal(ethers.utils.formatEther(await provider.getGasPrice()));
};
