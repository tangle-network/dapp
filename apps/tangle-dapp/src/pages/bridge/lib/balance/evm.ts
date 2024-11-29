import type { HexString } from '@polkadot/util/types';
import { FungibleTokenWrapper__factory } from '@webb-tools/contracts';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';

export const getEvmNativeBalance = async (params?: {
  provider: ethers.providers.BaseProvider;
  accAddress: HexString;
}): Promise<Decimal | null> => {
  if (!params) return null;
  const { accAddress, provider } = params;

  const balance = await provider.getBalance(accAddress);

  return new Decimal(ethers.utils.formatEther(balance));
};

export const getEvmContractBalance = async (params?: {
  provider: ethers.providers.BaseProvider;
  contractAddress: HexString;
  accAddress: HexString;
  decimals: number;
}): Promise<Decimal | null> => {
  if (!params) return null;
  const { provider, contractAddress, accAddress, decimals } = params;

  const contract = new ethers.Contract(
    contractAddress,
    FungibleTokenWrapper__factory.abi,
    provider,
  );

  const balance = await contract.balanceOf(accAddress);

  return new Decimal(ethers.utils.formatUnits(balance, decimals));
};
