import { BalanceInputValue, eliminateGap } from '@webb-dapp/react-components';
import { useApi, useBalance, useBalanceValidator, useConstants } from '@webb-dapp/react-hooks';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { Col, Row, SpaceBox } from '@webb-dapp/ui-components';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { CardRoot, CardSubTitle, CardTitle, CTxButton, WithdrawnTitle } from '../common';
import { TokenInput } from '@webb-dapp/react-components/TokenInput';
import AmountInput from '@webb-dapp/react-components/AmountInput/AmountInput';

export const DepositConsole: FC = () => {
  const { api } = useApi();
  const [token, setToken, { error: tokenError, setValidator: setTokenValidator }] = useInputValue<BalanceInputValue>({
    amount: 0,
  });
  const currencies: CurrencyId[] = [];

  // TODO: Grab token balance properly
  const balance = useBalance(token.token);

  useBalanceValidator({
    currency: token.token,
    updateValidator: setTokenValidator,
  });

  const handleSelectCurrencyChange = useCallback(
    (currency: CurrencyId) => {
      setToken({ token: currency });
    },
    [setToken]
  );

  const clearAmount = useCallback(() => {
    setToken({
      amount: 0,
      token: token.token,
    });
  }, [token, setToken]);

  const handleMax = useCallback(() => {
    setToken({
      amount: balance.toNumber(),
      token: token.token,
    });
  }, [balance, token, setToken]);

  const handleSuccess = useCallback((): void => clearAmount(), [clearAmount]);

  const isDisabled = useMemo(() => {
    if (!token.amount) return true;

    if (tokenError) return true;

    return false;
  }, [token, tokenError]);

  const params = useCallback(() => {
    if (!token.amount || !token.token) return [];

    // TODO: Properly handle params
    return [
      token,
      token,
      eliminateGap(new FixedPointNumber(token.amount), balance, new FixedPointNumber('0.000001')).toChainData(),
    ];
  }, [token, balance]);
  const { allCurrencies } = useConstants();

  const handleTokenCurrencyChange = useCallback(
    (currency: CurrencyId) => {
      setToken({ token: currency });
      clearAmount();
    },
    [setToken, clearAmount]
  );
  const items = useMemo(
    () => [
      {
        id: 1,
        amount: 1,
      },
      {
        id: 2,
        amount: 10,
      },
      {
        id: 3,
        amount: 100,
      },
      {
        id: 4,
        amount: 1000,
      },
    ],
    []
  );
  const [item, setItem] = useState<any>(undefined);
  return (
    <CardRoot>
      <CardTitle>Deposit</CardTitle>
      <SpaceBox height={16} />
      <CardSubTitle>Remove liquidity from a pool.</CardSubTitle>
      <SpaceBox height={24} />
      <Row gutter={[0, 24]}>
        <Col>
          <WithdrawnTitle>Deposit Token</WithdrawnTitle>
        </Col>
        <Col span={24}>
          <TokenInput currencies={allCurrencies} onChange={handleTokenCurrencyChange} value={token.token} />
        </Col>

        <Col>
          <WithdrawnTitle>Amount</WithdrawnTitle>
        </Col>
        <Col span={24}>
          <AmountInput items={items} value={item} onChange={setItem} />
        </Col>
        <Col span={24}>
          <CTxButton
            disabled={isDisabled}
            method='withdraw'
            onInblock={handleSuccess}
            params={params}
            section='mixer'
            size='large'
          >
            Deposit
          </CTxButton>
        </Col>
      </Row>
    </CardRoot>
  );
};
