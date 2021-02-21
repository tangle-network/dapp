import { BalanceInputValue, eliminateGap } from '@webb-dapp/react-components';
import AmountInput from '@webb-dapp/react-components/AmountInput/AmountInput';
import { TokenInput } from '@webb-dapp/react-components/TokenInput';
import { useApi, useBalance, useBalanceValidator, useConstants } from '@webb-dapp/react-hooks';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { Col, Row, SpaceBox } from '@webb-dapp/ui-components';
import { FixedPointNumber, Token, token2CurrencyId } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { CardRoot, CardSubTitle, CardTitle, CTxButton, DepositTitle } from '../common';

export const DepositConsole: FC = () => {
  const { api } = useApi();
  const [token, setToken, { error: tokenError, setValidator: setTokenValidator }] = useInputValue<BalanceInputValue>({
    amount: 0,
    token: token2CurrencyId(
      api,
      new Token({ name: 'EDG', symbol: 'EDG', chain: 'edgeware', amount: 0, precision: 18 })
    ),
  });
  // TODO: Grab token balance properly
  const balance = useBalance(token.token);

  console.log(token);
  const clearAmount = useCallback(() => {
    setToken({
      amount: 0,
      token: token.token,
    });
  }, [token, setToken]);

  const handleSuccess = useCallback((): void => clearAmount(), [clearAmount]);

  const isDisabled = useMemo(() => {
    if (!token.amount) return true;

    if (tokenError) return true;

    return false;
  }, [token, tokenError]);

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
      { amount: 1, id: 1 },
      { amount: 10, id: 2 },
      { amount: 100, id: 3 },
      { amount: 1000, id: 4 },
    ],
    []
  );
  const [item, setItem] = useState<any>(undefined);
  console.log(token);
  return (
    <CardRoot>
      <CardTitle>Deposit</CardTitle>
      <SpaceBox height={16} />
      <CardSubTitle>Deposit tokens into the anonymity pool.</CardSubTitle>
      <SpaceBox height={24} />
      <Row gutter={[0, 24]}>
        <Col>
          <DepositTitle>Deposit Token</DepositTitle>
        </Col>
        <Col span={24}>
          <TokenInput
            currencies={allCurrencies.filter((c) => {
              return c.toHuman().Token == 'EDG';
            })}
            onChange={handleTokenCurrencyChange}
            value={token.token}
          />
        </Col>

        <Col>
          <DepositTitle>Amount</DepositTitle>
        </Col>
        <Col span={24}>
          <AmountInput items={items} value={item} onChange={setItem} />
        </Col>
        <Col span={24}>
          <CTxButton
            disabled={isDisabled}
            method='deposit'
            onInblock={handleSuccess}
            params={[]}
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
