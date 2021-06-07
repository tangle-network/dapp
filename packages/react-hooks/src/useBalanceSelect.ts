/*
import { useApi } from '@webb-dapp/react-hooks/useApi';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { currencyId2Token } from '@webb-tools/sdk-core';
import { useCallback } from 'react';

export const useBalanceSelect = () => {
  const { api } = useApi();
  const [token, setToken, { error: tokenError }] = useInputValue({
    amount: 0,
    // @ts-ignore
    token: currencyId2Token(api.createType('CurrencyId', 0)),
  });
  const clearAmount = useCallback(() => {
    setToken({
      amount: 0,
      token: token.token,
    });
  }, [token, setToken]);
  return {
    clearAmount,
    setToken,
    token,
    tokenError,
  };
};
*/
export {};
