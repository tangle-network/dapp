import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
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

export default function useWrapButtonProps({
  balance,
  fungible,
}: {
  balance?: number;
  fungible?: CurrencyConfig;
}) {
  const { loading, isConnecting } = useWebContext();

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

  const { content: connectBtnCnt } = useConnectButtonProps(srcTypedId);

  const validAmount = useMemo(() => {
    if (typeof amount !== 'string' || amount.length === 0) {
      return false;
    }

    const amountBI = BigInt(amount); // amount from search params is parsed already

    // If balance is not a number, but amount is entered and > 0,
    // it means user not connected to wallet but entered amount
    // so we allow it
    if (typeof balance !== 'number' && amountBI > 0) {
      return true;
    }

    if (!balance || amountBI <= 0) {
      return false;
    }

    const parsedBalance = parseEther(numberToString(balance));

    return amountBI !== ZERO_BIG_INT && amountBI <= parsedBalance;
  }, [amount, balance]);

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

    if (!validAmount) {
      return 'Insufficient balance';
    }
  }, [amount, validAmount]);

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

      if (!allInputsFilled || !validAmount) {
        return true;
      }

      return false;
    },
    // prettier-ignore
    [amount, connectBtnCnt, fungibleTokenId, srcTypedId, wrappableTokenId, validAmount]
  );

  const isLoading = useMemo(() => {
    return loading || isConnecting;
  }, [isConnecting, loading]);

  const handleBtnClick = useCallback(() => {
    if (!fungible) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    // TODO: update functionality

    return;
  }, [fungible]);

  return {
    children,
    isLoading,
    loadingText: 'Connecting...',
    onClick: handleBtnClick,
    isDisabled,
  };
}
