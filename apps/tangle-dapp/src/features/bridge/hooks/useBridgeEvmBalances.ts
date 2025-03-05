import { chainsConfig } from '@tangle-network/dapp-config/chains';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import { Decimal } from 'decimal.js';
import { ethers } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Abi, createPublicClient, http } from 'viem';
import {
  BridgeChainBalances,
  BridgeToken,
  BridgeTokenWithBalance,
} from '@tangle-network/tangle-shared-ui/types';
import ensureError from '@tangle-network/tangle-shared-ui/utils/ensureError';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import useEvmAddress20 from '../../../hooks/useEvmAddress';
import { isSolanaAddress } from '@tangle-network/ui-components';
import assert from 'assert';
import { BRIDGE_TOKENS } from '@tangle-network/tangle-shared-ui/constants/bridge';

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

    const balance = await client.readContract({
      address: erc20Address,
      abi: tokenAbi,
      functionName: 'balanceOf',
      args: [accountAddress],
    });

    assert(
      typeof balance === 'bigint',
      `Bridge failed to read ERC20 token balance: Unexpected balance type returned, expected bigint but got ${typeof balance} (${balance})`,
    );

    return new Decimal(ethers.utils.formatUnits(balance, decimals));
  } catch {
    return new Decimal(0);
  }
};

export const useBridgeEvmBalances = (
  sourceChainId: number,
  destinationChainId: number,
) => {
  const accountEvmAddress = useEvmAddress20();
  const [balances, setBalances] = useState<BridgeChainBalances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add refs to track last fetch and avoid unnecessary fetches
  const lastFetchTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const fetchingRef = useRef<boolean>(false);

  // Minimum time between fetches in milliseconds (2 seconds)
  const MIN_FETCH_INTERVAL = 2000;

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

      const balance = await fetchEvmTokenBalance(
        address,
        chainId,
        token.address,
        token.abi,
        token.decimals,
      );

      let syntheticBalance: Decimal | undefined;
      if (token.hyperlaneSyntheticAddress) {
        syntheticBalance = await fetchEvmTokenBalance(
          address,
          chainId,
          token.hyperlaneSyntheticAddress,
          token.abi,
          token.decimals,
        );
      }

      return { ...token, balance, syntheticBalance };
    },
    [],
  );

  const fetchBalances = useCallback(async () => {
    // Check if the fetch should proceed
    if (
      accountEvmAddress === null ||
      !sourceChainId ||
      fetchingRef.current ||
      !isMountedRef.current
    ) {
      return;
    }

    // Check if we need to throttle requests
    const now = Date.now();
    if (now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL) {
      return;
    }

    fetchingRef.current = true;
    lastFetchTimeRef.current = now;

    setIsLoading(true);
    setError(null);

    try {
      const newBalances: Record<PresetTypedChainId, BridgeTokenWithBalance[]> =
        {};

      let tokens = BRIDGE_TOKENS[sourceChainId];
      if (!tokens || tokens.length === 0) {
        tokens = BRIDGE_TOKENS[destinationChainId];
      }

      const tokenBalancePromises = await Promise.allSettled(
        tokens.map((token) =>
          fetchTokenBalance(token, sourceChainId, accountEvmAddress),
        ),
      );

      const tokenBalances = tokenBalancePromises.reduce<
        BridgeTokenWithBalance[]
      >((acc, result) => {
        if (result.status === 'fulfilled' && result.value !== null) {
          acc.push(result.value);
        }

        return acc;
      }, []);

      newBalances[sourceChainId] = tokenBalances;

      if (isMountedRef.current) {
        setBalances(newBalances);
      }
    } catch (possibleError) {
      const error = ensureError(possibleError);
      if (isMountedRef.current) {
        setError(`Failed to fetch token balances: ${error.message}`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [accountEvmAddress, destinationChainId, fetchTokenBalance, sourceChainId]);

  // Only fetch on mount and when dependencies actually change
  useEffect(() => {
    isMountedRef.current = true;
    fetchBalances();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    error,
    refresh: fetchBalances,
  };
};
