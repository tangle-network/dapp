import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import {
  AMOUNT_KEY,
  DEST_CHAIN_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../../../constants';
import useCurrenciesFromRoute from '../../../../../hooks/useCurrenciesFromRoute';

function useWatchSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { allCurrencies, fungibleCfg, wrappableCfg } = useCurrenciesFromRoute();

  const { activeChain, apiConfig, activeApi } = useWebContext();

  const [srcTypedChainId, destTypedChainId, tokenId, amountStr] =
    useMemo(() => {
      const sourceStr = searchParams.get(SOURCE_CHAIN_KEY) ?? '';
      const destStr = searchParams.get(DEST_CHAIN_KEY) ?? '';

      const tokenStr = searchParams.get(TOKEN_KEY) ?? '';

      const amountStr = searchParams.get('amount') ?? '';

      return [
        !Number.isNaN(parseInt(sourceStr)) ? parseInt(sourceStr) : undefined,
        !Number.isNaN(parseInt(destStr)) ? parseInt(destStr) : undefined,
        !Number.isNaN(parseInt(tokenStr)) ? parseInt(tokenStr) : undefined,
        amountStr.length ? formatEther(BigInt(amountStr)) : '',
      ];
    }, [searchParams]);

  const [amount, setAmount] = useState(amountStr);

  useEffect(() => {
    setSearchParams((prev) => {
      if (prev.has(SOURCE_CHAIN_KEY) || !activeChain) {
        return prev;
      }

      const typedChainId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.id
      );
      const nextParams = new URLSearchParams(prev);
      nextParams.set(SOURCE_CHAIN_KEY, `${typedChainId}`);
      return nextParams;
    });
  }, [activeChain, setSearchParams]);

  const activeBridge = useMemo(() => {
    return activeApi?.state.activeBridge;
  }, [activeApi]);

  // Find default pool id when source chain is changed
  const defaultPoolId = useMemo(() => {
    if (!srcTypedChainId) {
      return;
    }

    if (
      activeBridge &&
      Object.keys(activeBridge.targets).includes(`${srcTypedChainId}`)
    ) {
      return `${activeBridge.currency.id}`;
    }

    const anchor = Object.entries(apiConfig.anchors).find(
      ([, anchorsRecord]) => {
        return Object.keys(anchorsRecord).includes(`${srcTypedChainId}`);
      }
    );

    return anchor?.[0];
  }, [activeBridge, apiConfig.anchors, srcTypedChainId]);

  useEffect(() => {
    if (!defaultPoolId) {
      return;
    }

    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set(POOL_KEY, `${defaultPoolId}`);

      return nextParams;
    });
  }, [defaultPoolId, setSearchParams]);

  // Remove token if it is not supported
  useEffect(() => {
    if (typeof tokenId !== 'number') {
      return;
    }

    const currency = allCurrencies.find((c) => c.id === tokenId);
    // No currency means the token is not supported
    if (!currency) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete(TOKEN_KEY);
        return nextParams;
      });
    }
  }, [allCurrencies, setSearchParams, tokenId]);

  // Remove destination chain if it is not supported
  useEffect(() => {
    if (!destTypedChainId) {
      return;
    }

    if (!fungibleCfg) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete(DEST_CHAIN_KEY);
        return nextParams;
      });
      return;
    }

    const anchor = apiConfig.anchors[fungibleCfg.id];
    if (!Object.keys(anchor).includes(`${destTypedChainId}`)) {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.delete(DEST_CHAIN_KEY);
        return nextParams;
      });
    }
  }, [apiConfig.anchors, destTypedChainId, fungibleCfg, setSearchParams]);

  // Update amount on search params with debounce
  useEffect(() => {
    function updateParams() {
      if (!amount) {
        return setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.delete(AMOUNT_KEY);
          return nextParams;
        });
      }

      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set(AMOUNT_KEY, `${parseEther(amount)}`);
        return nextParams;
      });
    }

    const timeout = setTimeout(updateParams, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [amount, setSearchParams]);

  const handleAmountChange = useCallback((amount: string) => {
    const validationRegex = /^\d*\.?\d*$/;
    const isValid = validationRegex.test(amount);
    if (isValid) {
      setAmount(amount);
    }
  }, []);

  return {
    allCurrencies,
    amount,
    destTypedChainId,
    fungibleCfg,
    onAmountChange: handleAmountChange,
    searchParams,
    setSearchParams,
    srcTypedChainId,
    wrappableCfg,
  };
}

export default useWatchSearchParams;
