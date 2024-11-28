import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { AddressType } from '@webb-tools/dapp-config/types';
import Decimal from 'decimal.js';
import { BigNumberish } from 'ethers';
import { ethers } from 'ethers';
import { Abi, createPublicClient, getContract, http } from 'viem';

export const getEVMTokenBalance = async (
  accountAddress: string,
  chainId: number,
  tokenAddress: AddressType,
  tokenAbi: Abi,
  decimals: number,
) => {
  try {
    const client = createPublicClient({
      chain: chainsConfig[chainId],
      transport: http(),
    });

    const contract = getContract({
      address: tokenAddress,
      abi: tokenAbi,
      client,
    });

    const balance = await contract.read.balanceOf([accountAddress]);

    return new Decimal(
      ethers.utils.formatUnits(balance as BigNumberish, decimals),
    );
  } catch (error) {
    console.error(error);
    return new Decimal(0);
  }
};
