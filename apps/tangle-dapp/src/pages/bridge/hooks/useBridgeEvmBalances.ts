import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { Decimal } from 'decimal.js';
import { ethers } from 'ethers';
import { useCallback, useState } from 'react';
import { Abi, createPublicClient, getContract, http } from 'viem';

import {
  BridgeChainBalances,
  BridgeToken,
  BridgeTokenWithBalance,
} from '@webb-tools/tangle-shared-ui/types';
import { BRIDGE_TOKENS } from '../constants';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import useEvmAddress20 from '../../../hooks/useEvmAddress';
import { isSolanaAddress } from '@webb-tools/webb-ui-components';
import assert from 'assert';

export const fetchEvmTokenBalance = async (
  accountAddress: string,
  chainId: number,
  erc20Address: EvmAddress,
  tokenAbi: Abi,
  decimals: number,
) => {
  try {
    const client = createPublicClient({
      chain: chainsConfig[chainId],
      transport: http(),
    });

    const contract = getContract({
      address: erc20Address,
      abi: tokenAbi,
      client,
    });

    const balance = await contract.read.balanceOf([accountAddress]);

    assert(
      typeof balance === 'bigint',
      `Bridge failed to read ERC-20 token balance: Unexpected balance type returned, expected bigint but got ${typeof balance} (${balance})`,
    );

    return new Decimal(ethers.utils.formatUnits(balance, decimals));
  } catch (error) {
    console.error('Bridge failed to fetch EVM token balance:', error);

    // Assume that the balance is 0 if fetching it failed.
    return new Decimal(0);
  }
};

export const useBridgeEvmBalances = () => {
  const accountEvmAddress = useEvmAddress20();
  const [balances, setBalances] = useState<BridgeChainBalances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenBalance = useCallback(
    async (
      token: BridgeToken,
      chainId: PresetTypedChainId,
      address: EvmAddress,
    ): Promise<BridgeTokenWithBalance> => {
      // TODO: Not all tokens are ERC20, ex. Solana. Handle the edge cases. For now, just return a balance of 0.
      if (isSolanaAddress(token.address)) {
        return { ...token, balance: new Decimal(0) };
      }

      try {
        const balance = await fetchEvmTokenBalance(
          address,
          chainId,
          token.address,
          token.abi,
          token.decimals,
        );

        return { ...token, balance };
      } catch (possibleError) {
        const error = ensureError(possibleError);

        console.error(
          `Failed to fetch balance for token ${token.tokenSymbol}:`,
          error,
        );

        return { ...token, balance: new Decimal(0) };
      }
    },
    [],
  );

  const fetchBalances = useCallback(async () => {
    // Can't fetch balances without an EVM account connected.
    if (accountEvmAddress === null) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newBalances: BridgeChainBalances = {};
      const chainEntries = Object.entries(BRIDGE_TOKENS);

      // Fetch balances for all chains.
      const results = await Promise.allSettled(
        chainEntries.map(async ([chainIdStr, tokens]) => {
          const chainId = Number(chainIdStr) as PresetTypedChainId;

          const tokenBalances = await Promise.all(
            tokens.map((token) =>
              fetchTokenBalance(token, chainId, accountEvmAddress),
            ),
          );

          return { chainId, tokenBalances };
        }),
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { chainId, tokenBalances } = result.value;

          newBalances[chainId] = tokenBalances;
        }
      });

      setBalances(newBalances);
    } catch (possibleError) {
      const error = ensureError(possibleError);

      console.error('Bridge failed to fetch EVM balances:', error);
      setError(`Failed to fetch token balances: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [accountEvmAddress, fetchTokenBalance]);

  return {
    balances,
    isLoading,
    error,
    refresh: fetchBalances,
  };
};
