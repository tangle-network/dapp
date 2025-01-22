import { chainsConfig } from '@webb-tools/dapp-config';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import assert from 'assert';
import { Decimal } from 'decimal.js';
import { ethers } from 'ethers';
import { Abi, createPublicClient, http } from 'viem';

const fetchErc20TokenBalance = async (
  accountAddress: EvmAddress,
  chainId: number,
  contractAddress: EvmAddress,
  tokenAbi: Abi,
  decimals: number,
): Promise<Decimal> => {
  try {
    const client = createPublicClient({
      chain: chainsConfig[chainId],
      // TODO: Just for debugging / temporary.
      transport: http('http://127.0.0.1:9944'),
    });

    const balance = await client.readContract({
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
    console.error('Failed to fetch ERC20 token balance:', e);

    return new Decimal(0);
  }
};

export default fetchErc20TokenBalance;
