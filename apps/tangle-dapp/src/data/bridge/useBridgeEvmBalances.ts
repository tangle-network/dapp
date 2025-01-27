import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { Decimal } from 'decimal.js';
import { useCallback, useEffect, useState } from 'react';

import {
  BridgeChainBalances,
  BridgeToken,
  BridgeTokenWithBalance,
} from '@webb-tools/tangle-shared-ui/types';
import { BRIDGE_TOKENS } from '../../constants/bridge';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import { isSolanaAddress } from '@webb-tools/webb-ui-components';
import fetchErc20TokenBalance from '@webb-tools/tangle-shared-ui/utils/fetchErc20TokenBalance';
import useViemPublicClient from '@webb-tools/tangle-shared-ui/hooks/useViemPublicClient';

export const useBridgeEvmBalances = (
  sourceChainId: number,
  destinationChainId: number,
) => {
  const accountEvmAddress = useEvmAddress20();

  const [balances, setBalances] = useState<BridgeChainBalances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viemPublicClient = useViemPublicClient();

  const fetchTokenBalance = useCallback(
    async (
      token: BridgeToken,
      chainId: PresetTypedChainId,
      address: EvmAddress,
    ): Promise<BridgeTokenWithBalance> => {
      if (viemPublicClient === null || isSolanaAddress(token.address)) {
        // TODO: Not all tokens are ERC20, ex. Solana. Handle the edge cases. For now, just return a balance of 0.
        return { ...token, balance: new Decimal(0) };
      }

      const balance = await fetchErc20TokenBalance(
        viemPublicClient,
        address,
        token.address,
        token.abi,
        token.decimals,
      );

      let syntheticBalance: Decimal | undefined;

      if (token.hyperlaneSyntheticAddress) {
        syntheticBalance = await fetchErc20TokenBalance(
          viemPublicClient,
          address,
          token.hyperlaneSyntheticAddress,
          token.abi,
          token.decimals,
        );
      }

      return { ...token, balance, syntheticBalance };
    },
    [viemPublicClient],
  );

  const fetchAllBalances = useCallback(async () => {
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
    fetchAllBalances();
  }, [fetchAllBalances]);

  return {
    balances,
    isLoading,
    error,
    refresh: fetchAllBalances,
  };
};
