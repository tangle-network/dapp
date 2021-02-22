import { BalanceInputValue } from '@webb-dapp/react-components';
import AmountInput from '@webb-dapp/react-components/AmountInput/AmountInput';
import { TokenInput } from '@webb-dapp/react-components/TokenInput';
import { useApi, useConstants, useMixer } from '@webb-dapp/react-hooks';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { Col, Row, SpaceBox } from '@webb-dapp/ui-components';
import { Token, token2CurrencyId } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { CardRoot, CardSubTitle, CardTitle, CTxButton, DepositTitle } from '../common';

export const DepositConsole: FC = () => {
  const { api } = useApi();
  const { mixerInfos } = useMixer();
  const [token, setToken, { error: tokenError }] = useInputValue<BalanceInputValue>({
    amount: 0,
    token: token2CurrencyId(
      api,
      new Token({ amount: 0, chain: 'edgeware', name: 'EDG', precision: 18, symbol: 'EDG' })
    ),
  });

  const clearAmount = useCallback(() => {
    setToken({
      amount: 0,
      token: token.token,
    });
  }, [token, setToken]);

  const handleSuccess = useCallback((): void => clearAmount(), [clearAmount]);

  const isDisabled = useMemo(() => {
    if (typeof token.amount === 'undefined') return true;
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
  const items = useMemo(() => {
    return mixerInfos.map((info) => {
      return {
        amount: Number(info[1]['fixed_deposit_size']),
        // TODO: Make this more clearer, this is a number for the GroupId
        // but we should ensure that we have classes implementing these types
        // so that we can marshall properly
        id: Number(info[0].toHuman()[0]),
      };
    });
  }, [mixerInfos]);
  const [item, setItem] = useState<any>(undefined);

  const params = useCallback(() => {
    // ensure that this must be checked by isDisabled
    if (!token.token || typeof token.amount === 'undefined') return [];
    let groupId = mixerInfos.find((g) => g[1]['fixed_deposit_size'].toNumber() === item);
    let noteCommitment = null;
    return [groupId, noteCommitment];
  }, [token, item, mixerInfos]);

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
