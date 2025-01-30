import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { Decimal } from 'decimal.js';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { Abi, createPublicClient, http } from 'viem';

import {
  BridgeChainBalances,
  BridgeToken,
  BridgeTokenWithBalance,
} from '@webb-tools/tangle-shared-ui/types';
import { BRIDGE_TOKENS } from '../../../../../libs/tangle-shared-ui/src/constants/bridge';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import useEvmAddress20 from '../../hooks/useEvmAddress';
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
    if (accountEvmAddress === null || !sourceChainId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newBalances: Record<PresetTypedChainId, BridgeTokenWithBalance[]> =
        {};

      let tokens = BRIDGE_TOKENS[sourceChainId];
      if (!tokens || tokens.length === 0) {
        tokens = BRIDGE_TOKENS[destinationChainId];
      }

      const tokenBalances = await Promise.all(
        tokens.map((token) =>
          fetchTokenBalance(token, sourceChainId, accountEvmAddress),
        ),
      );

      newBalances[sourceChainId] = tokenBalances;

      setBalances(newBalances);
    } catch (possibleError) {
      const error = ensureError(possibleError);
      setError(`Failed to fetch token balances: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [accountEvmAddress, destinationChainId, fetchTokenBalance, sourceChainId]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    error,
    refresh: fetchBalances,
  };
};
