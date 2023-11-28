import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ZERO_BIG_INT, chainsPopulated } from '@webb-tools/dapp-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
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
import handleTxError from '../../../../../utils/handleTxError';

export default function useWrapButtonProps({
  balances,
}: {
  balances?: number;
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
    if (typeof amount !== 'string' || amount.length === 0) {
      return false;
    }

    const amountBI = BigInt(amount); // amount from search params is parsed already

    // If balances is not a number, but amount is entered and > 0,
    // it means user not connected to wallet but entered amount
    // so we allow it
    if (typeof balances !== 'number' && amountBI > 0) {
      return true;
    }

    if (!balances || amountBI <= 0) {
      return false;
    }

    const parsedBalance = parseEther(numberToString(balances));

    return amountBI !== ZERO_BIG_INT && amountBI <= parsedBalance;
  }, [amount, balances]);

  const inputCnt = useMemo(() => {
    if (typeof wrappableTokenId !== 'number') {
      return 'Select token to be wrapped';
    }

    if (typeof amount !== 'string' || amount.length === 0) {
      return 'Enter amount';
    }

    if (typeof fungibleTokenId !== 'number') {
      return 'Select wrapped token';
    }

    if (typeof srcTypedId !== 'number') {
      return 'Select source chain';
    }

    return undefined;
  }, [amount, fungibleTokenId, wrappableTokenId, srcTypedId]);

  const amountCnt = useMemo(() => {
    if (typeof amount !== 'string' || BigInt(amount) === ZERO_BIG_INT) {
      return 'Enter amount';
    }

    if (!isValidAmount) {
      return 'Insufficient balances';
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

        const fungibleTokenIdNum = Number(fungibleTokenId);
        if (Number.isNaN(fungibleTokenIdNum)) {
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
    [activeApi, amount, fungibleTokenId, connectBtnCnt, srcTypedId, handleConnect, noteManager]
  );

  return {
    children,
    isLoading,
    loadingText: 'Connecting...',
    onClick: handleBtnClick,
    isDisabled,
  };
}
