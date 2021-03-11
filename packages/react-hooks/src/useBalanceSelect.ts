import { BalanceInputValue } from '@webb-dapp/react-components';
import { useApi } from '@webb-dapp/react-hooks/useApi';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { Token, token2CurrencyId } from '@webb-tools/sdk-core';
import { useCallback } from 'react';

export const useBalanceSelect = () => {
  const { api } = useApi();
  const [token, setToken, { error: tokenError }] = useInputValue<BalanceInputValue>({
    amount: 0,
    token: token2CurrencyId(
      api,
      new Token({ amount: 0, chain: 'edgeware', name: 'EDG', precision: 12, symbol: 'EDG' })
    ),
  });
  const clearAmount = useCallback(() => {
    setToken({
      amount: 0,
      token: token.token,
    });
  }, [token, setToken]);
  return {
    clearAmount,
    token,
    tokenError,
    setToken,
  };
};
