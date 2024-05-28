import type { HexString } from '@polkadot/util/types';
import { FungibleTokenWrapper__factory } from '@webb-tools/contracts';
import getViemClient from '@webb-tools/web3-api-provider/utils/getViemClient';
import Decimal from 'decimal.js';
import { formatEther, formatUnits, getContract } from 'viem';

export const getEvmNativeBalance = async (params?: {
  client: ReturnType<typeof getViemClient>;
  accAddress: HexString;
}): Promise<Decimal | null> => {
  if (!params) return null;
  const { client, accAddress } = params;

  const balance = await client.getBalance({
    address: accAddress,
  });

  return new Decimal(formatEther(balance));
};

export const getEvmContractBalance = async (params?: {
  client: ReturnType<typeof getViemClient>;
  contractAddress: HexString;
  accAddress: HexString;
  decimals: number;
}): Promise<Decimal | null> => {
  if (!params) return null;
  const { client, contractAddress, accAddress, decimals } = params;

  const contract = getContract({
    address: contractAddress,
    // TODO: replace this with the abi of ERC20 contract deployed by Sygma team
    abi: FungibleTokenWrapper__factory.abi,
    client,
  });

  const balance = await contract.read.balanceOf([accAddress]);

  return new Decimal(formatUnits(balance, decimals));
};
