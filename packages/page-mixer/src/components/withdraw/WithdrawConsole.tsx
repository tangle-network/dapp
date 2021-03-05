import { BalanceInputValue, eliminateGap } from '@webb-dapp/react-components';
import { useBalance, useBalanceValidator, useConstants, useMixerProvider } from '@webb-dapp/react-hooks';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC, useCallback, useState } from 'react';

import { CardRoot, CardTitle } from '../common';
import { useWithdraw } from '@webb-dapp/react-hooks/withdraw/useWithdraw';
import { Fab, TextField } from '@material-ui/core';
import { SpaceBox } from '@webb-dapp/ui-components/';

export const WithdrawConsole: FC = () => {
  const [token, setToken, { error: tokenError, setValidator: setTokenValidator }] = useInputValue<BalanceInputValue>({
    amount: 0,
  });

  useBalanceValidator({
    currency: token.token,
    updateValidator: setTokenValidator,
  });

  const clearAmount = useCallback(() => {
    setToken({ amount: 0 });
  }, [setToken]);

  const handleTokenCurrencyChange = useCallback(
    (currency: CurrencyId) => {
      setToken({ token: currency });
      clearAmount();
    },
    [setToken, clearAmount]
  );

  const tokenBalance = useBalance(token.token);

  const params = useCallback(() => {
    // ensure that this must be checked by isDisabled
    if (!token.token || !token.amount) return [];

    return [token.token, eliminateGap(new FixedPointNumber(token.amount), tokenBalance).toChainData()];
  }, [token, tokenBalance]);

  const handleSuccess = useCallback(() => {
    clearAmount();
  }, [clearAmount]);

  const handleTokenAmountChange = useCallback(
    ({ amount, token }: Partial<BalanceInputValue>) => {
      setToken({ amount });
    },
    [setToken]
  );

  const { allCurrencies } = useConstants();

  // calculate current max assets amount according to current user balance
  const handleMax = useCallback(() => {
    if (!token.token) return;

    const tokenAmount = tokenBalance.toNumber();
    // TODO: Get max balance for the token type
  }, [setToken, tokenBalance, token]);

  const [note, setNote] = useState('');

  const { withdraw } = useWithdraw(note);
  return (
    <CardRoot>
      <CardTitle>Withdraw</CardTitle>
      <TextField fullWidth label={'note'} value={note} onChange={({ target: { value } }) => setNote(value)} />
      <SpaceBox height={24} />
      <Fab
        onClick={() => {
          withdraw();
        }}
        variant={'extended'}
        color='primary'
      >
        Withdraw
      </Fab>
    </CardRoot>
  );
};
