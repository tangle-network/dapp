import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ZERO_BIG_INT, chainsPopulated } from '@webb-tools/dapp-config';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { useCallback, useMemo } from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';
import { parseEther } from 'viem';
import {
  AMOUNT_KEY,
  POOL_KEY,
  SOURCE_CHAIN_KEY,
  TOKEN_KEY,
} from '../../../../../constants';
import useConnectButtonProps from '../../../../../hooks/useConnectButtonProps';
import { useBalancesFromNotes } from '@webb-tools/react-hooks';
import handleTxError from '../../../../../utils/handleTxError';

export default function useUnwrapButtonProps({
  balances,
  fungibleCfg,
}: {
  balances: ReturnType<typeof useBalancesFromNotes>['balances'];
  fungibleCfg?: CurrencyConfig;
}) {
  const { activeApi, loading, isConnecting, noteManager } = useWebContext();

  const [query] = useQueryParams({
    [AMOUNT_KEY]: StringParam,
    [TOKEN_KEY]: NumberParam,
    [POOL_KEY]: NumberParam,
    [SOURCE_CHAIN_KEY]: NumberParam,
  });

  const {
    [AMOUNT_KEY]: amount,
    [TOKEN_KEY]: wrappableTokenId,
    [POOL_KEY]: fungibleTokenId,
    [SOURCE_CHAIN_KEY]: srcTypedId,
  } = query;

  const { content: connectBtnCnt, handleConnect } =
    useConnectButtonProps(srcTypedId);

  const isValidAmount = useMemo(() => {
    if (!fungibleCfg) {
      return false;
    }

    if (typeof srcTypedId !== 'number') {
      return false;
    }

    if (!amount) {
      return false;
    }

    const amountFloat = parseFloat(amount);
    const balance = balances[fungibleCfg.id]?.[srcTypedId];

    if (!balance || amountFloat <= 0) {
      return false;
    }

    return parseEther(amount) <= balance;
  }, [amount, balances, srcTypedId, fungibleCfg]);

  const inputCnt = useMemo(() => {
    if (typeof fungibleTokenId !== 'number') {
      return 'Select token to be unwrapped';
    }

    if (typeof amount !== 'string' || amount.length === 0) {
      return 'Enter amount';
    }

    if (typeof wrappableTokenId !== 'number') {
      return 'Select unwrapped token';
    }

    if (typeof srcTypedId !== 'number') {
      return 'Select chain';
    }

    return undefined;
  }, [amount, fungibleTokenId, wrappableTokenId, srcTypedId]);

  const amountCnt = useMemo(() => {
    if (typeof amount !== 'string' || BigInt(amount) === ZERO_BIG_INT) {
      return 'Enter amount';
    }

    if (!isValidAmount) {
      return 'Insufficient balance';
    }
  }, [amount, isValidAmount]);

  const children = useMemo(() => {
    if (connectBtnCnt) {
      return connectBtnCnt;
    }

    if (inputCnt) {
      return inputCnt;
    }

    if (amountCnt) {
      return amountCnt;
    }

    return 'Wrap';
  }, [amountCnt, connectBtnCnt, inputCnt]);

  const isDisabled = useMemo(
    () => {
      if (connectBtnCnt) {
        return false;
      }

      const allInputsFilled =
        !!amount && !!wrappableTokenId && !!fungibleTokenId && !!srcTypedId;

      if (!allInputsFilled || !isValidAmount) {
        return true;
      }

      return false;
    },
    // prettier-ignore
    [amount, connectBtnCnt, fungibleTokenId, srcTypedId, wrappableTokenId, isValidAmount]
  );

  const isLoading = useMemo(() => {
    return loading || isConnecting;
  }, [isConnecting, loading]);

  const handleBtnClick = useCallback(
    async () => {
      let actualApi = activeApi;

      try {
        if (connectBtnCnt && typeof srcTypedId === 'number') {
          const nextApi = await handleConnect(srcTypedId);
          if (!nextApi?.noteManager) {
            return;
          }

          actualApi = nextApi;
        }

        if (!noteManager || !actualApi) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        if (!fungibleCfg) {
          throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
        }

        const srcTypedIdNum = Number(srcTypedId);

        if (Number.isNaN(srcTypedIdNum)) {
          throw WebbError.from(WebbErrorCodes.UnsupportedChain);
        }

        const srcChain = chainsPopulated[srcTypedIdNum];

        if (!srcChain) {
          throw WebbError.from(WebbErrorCodes.UnsupportedChain);
        }

        if (typeof amount !== 'string' || amount.length === 0) {
          throw WebbError.from(WebbErrorCodes.InvalidAmount);
        }

        // TODO: handle wrapping logic
      } catch (error) {
        handleTxError(error, 'Wrap');
      }
    },
    // prettier-ignore
    [activeApi, amount, fungibleCfg, connectBtnCnt, srcTypedId, handleConnect, noteManager]
  );

  return {
    children,
    isLoading,
    loadingText: 'Connecting...',
    onClick: handleBtnClick,
    isDisabled,
  };
}
