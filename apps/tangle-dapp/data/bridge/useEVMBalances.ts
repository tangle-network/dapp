import { PresetTypedChainId } from '@webb-tools/dapp-types';
import useLocalStorage, {
  LocalStorageKey,
} from '@webb-tools/tangle-shared-ui/hooks/useLocalStorage';
import { Decimal } from 'decimal.js';
import { useCallback, useEffect, useState } from 'react';

import { BRIDGE_TOKENS } from '../../constants/bridge/constants';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { BridgeTokenType } from '../../types/bridge/types';
import { getEVMTokenBalance } from './getEVMTokenBalance';

export type TokenBalanceType = BridgeTokenType & {
  balance: Decimal;
};

type BalanceType = Partial<Record<PresetTypedChainId, TokenBalanceType[]>>;

export const useEVMBalances = () => {
  const activeAccountAddress = useActiveAccountAddress();
  const [balances, setBalances] = useState<BalanceType>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { valueOpt: cachedBalances, set: setCachedBalances } = useLocalStorage(
    LocalStorageKey.EVM_TOKEN_BALANCES,
  );

  const fetchTokenBalance = useCallback(
    async (
      token: BridgeTokenType,
      chainId: PresetTypedChainId,
      address: string,
    ): Promise<TokenBalanceType> => {
      try {
        const balance = await getEVMTokenBalance(
          address,
          chainId,
          token.address,
          token.abi,
          token.decimals,
        );
        return { ...token, balance };
      } catch (err) {
        console.error(
          `Failed to fetch balance for token ${token.tokenSymbol}:`,
          err,
        );
        return { ...token, balance: new Decimal(0) };
      }
    },
    [],
  );

  const fetchBalances = useCallback(async () => {
    if (!activeAccountAddress) {
      setBalances({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newBalances: BalanceType = {};
      const chainEntries = Object.entries(BRIDGE_TOKENS);

      // Fetch balances for all chains
      const results = await Promise.allSettled(
        chainEntries.map(async ([chainIdStr, tokens]) => {
          const chainId = Number(chainIdStr) as PresetTypedChainId;

          // Fetch all token balances for this chain
          const tokenBalances = await Promise.all(
            tokens.map((token) =>
              fetchTokenBalance(token, chainId, activeAccountAddress),
            ),
          );

          return { chainId, tokenBalances };
        }),
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { chainId, tokenBalances } = result.value;

          // Add chains that have tokens with non-zero balances
          // if (tokenBalances.some((token) => !token.balance.isZero())) {
          //   newBalances[chainId] = tokenBalances;
          // }

          newBalances[chainId] = tokenBalances;
        }
      });

      console.debug('✅ EVM Balances fetched successfully');
      setBalances(newBalances);
      // Store in local storage
      setCachedBalances({ [activeAccountAddress]: newBalances });
    } catch (err) {
      console.error('❌ Failed to fetch EVM balances:', err);
      setError('Failed to fetch token balances');
    } finally {
      setIsLoading(false);
    }
  }, [activeAccountAddress, fetchTokenBalance, setCachedBalances]);

  useEffect(() => {
    if (!activeAccountAddress) return;

    const initializeBalances = async () => {
      // Check if we have valid cached balances for this address
      if (cachedBalances?.value?.[activeAccountAddress]) {
        console.debug('📦 Using cached EVM balances');
        setBalances(cachedBalances.value[activeAccountAddress]);
      } else {
        // Only fetch if we don't have cached balances
        console.debug('🔄 No cached balances found, fetching EVM balances...');
        await fetchBalances();
      }
    };

    initializeBalances();
  }, [activeAccountAddress, cachedBalances, fetchBalances]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances,
  };
};
