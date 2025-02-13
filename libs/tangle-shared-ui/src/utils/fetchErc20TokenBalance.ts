import { EvmAddress } from '@tangle-network/ui-components/types/address';
import assert from 'assert';
import { Decimal } from 'decimal.js';
import { ethers } from 'ethers';
import { Abi, PublicClient } from 'viem';

const fetchErc20TokenBalance = async (
  viemPublicClient: PublicClient,
  accountAddress: EvmAddress,
  contractAddress: EvmAddress,
  tokenAbi: Abi,
  decimals: number,
): Promise<Decimal | null> => {
  try {
    const balance = await viemPublicClient.readContract({
      address: contractAddress,
      abi: tokenAbi,
      functionName: 'balanceOf',
      args: [accountAddress],
    });

    assert(
      typeof balance === 'bigint',
      `Bridge failed to read ERC20 token balance: Unexpected balance type returned, expected bigint but got ${typeof balance} (${balance})`,
    );

    return new Decimal(ethers.utils.formatUnits(balance, decimals));
  } catch (e) {
    console.warn(
      `Failed to fetch ERC20 token balance (is the contract deployed on this network?) (chain: ${viemPublicClient.chain?.name}, account: ${accountAddress}): ${e}`,
    );

    return null;
  }
};

export default fetchErc20TokenBalance;
