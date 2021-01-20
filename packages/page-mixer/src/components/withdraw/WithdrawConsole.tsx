import React, { FC, useCallback, useMemo } from 'react';

import { FlexBox, Row, Col, SpaceBox } from '@webb-dapp/ui-components';
import { BalanceInput, BalanceInputValue, getCurrenciesFromDexShare, eliminateGap } from '@webb-dapp/react-components';
import { useLPCurrencies, useApi, useBalance, useBalanceValidator } from '@webb-dapp/react-hooks';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { CurrencyId } from '@acala-network/types/interfaces';
import { TokenInput } from '@webb-dapp/react-components/TokenInput';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';

import { WithdrawInfo } from './WithdrawInfo';
import { AmountTitle, CardRoot, CardSubTitle, CardTitle, CTxButton, WithdrawnTitle, CMaxBtn } from '../common';

export const WithdrawConsole: FC = () => {
  const { api } = useApi();
  const lpCurrencies = useLPCurrencies();
  const [selectedLP, setSelectedLP, { error, setValidator }] = useInputValue<BalanceInputValue>({
    amount: 0,
    token: lpCurrencies[0]
  });
  const balance = useBalance(selectedLP.token);

  useBalanceValidator({
    currency: selectedLP.token,
    updateValidator: setValidator
  });

  const handleSelectLPCurrencyChange = useCallback(
    (currency: CurrencyId) => {
      setSelectedLP({ token: currency });
    },
    [setSelectedLP]
  );

  const clearAmount = useCallback(() => {
    setSelectedLP({
      amount: 0,
      token: selectedLP.token
    });
  }, [setSelectedLP, selectedLP]);

  const handleMax = useCallback(() => {
    setSelectedLP({
      amount: balance.toNumber(),
      token: selectedLP.token
    });
  }, [balance, setSelectedLP, selectedLP]);

  const handleSuccess = useCallback((): void => clearAmount(), [clearAmount]);

  const params = useCallback(() => {
    if (!selectedLP.amount || !selectedLP.token) return [];

    const [token1, token2] = getCurrenciesFromDexShare(api, selectedLP.token);

    return [
      token1,
      token2,
      eliminateGap(new FixedPointNumber(selectedLP.amount), balance, new FixedPointNumber('0.000001')).toChainData()
    ];
  }, [selectedLP, api, balance]);

  const isDisabled = useMemo(() => {
    if (!selectedLP.amount) return true;

    if (error) return true;

    return false;
  }, [selectedLP, error]);

  return (
    <CardRoot>
      <CardTitle>Withdraw Liquidity</CardTitle>
      <SpaceBox height={16} />
      <CardSubTitle>Remove liquidity from a pool.</CardSubTitle>
      <SpaceBox height={24} />
      <Row gutter={[0, 24]}>
        <Col>
          <WithdrawnTitle>Withdraw Token</WithdrawnTitle>
        </Col>
        <Col span={24}>
          <TokenInput currencies={lpCurrencies} onChange={handleSelectLPCurrencyChange} value={selectedLP.token} />
        </Col>
        <Col span={24}>
          <FlexBox justifyContent='space-between'>
            <AmountTitle>Amount</AmountTitle>
            <CMaxBtn onClick={handleMax} type='ghost'>
              MAX
            </CMaxBtn>
          </FlexBox>
        </Col>
        <Col span={24}>
          <BalanceInput
            enableTokenSelect={false}
            error={error}
            onChange={setSelectedLP}
            showIcon={false}
            value={selectedLP}
          />
        </Col>
        {selectedLP.token ? (
          <Col span={24}>
            <WithdrawInfo token={(selectedLP as any) as BalanceInputValue} />
          </Col>
        ) : null}
        <Col span={24}>
          <CTxButton
            disabled={isDisabled}
            method='removeLiquidity'
            onInblock={handleSuccess}
            params={params}
            section='dex'
            size='large'
          >
            Withdraw Liquidity
          </CTxButton>
        </Col>
      </Row>
    </CardRoot>
  );
};
