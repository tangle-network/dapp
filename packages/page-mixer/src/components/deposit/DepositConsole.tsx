import React, { FC, useCallback, useMemo, useEffect } from 'react';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces';

import { Row, Col, FlexBox, SpaceBox } from '@webb-dapp/ui-components';
import { useBalance, useBalanceValidator } from '@webb-dapp/react-hooks';
import { BalanceInput, BalanceInputValue, tokenEq, eliminateGap, Token } from '@webb-dapp/react-components';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { TokenInput } from '@webb-dapp/react-components/TokenInput';

import { CardRoot, CardTitle, CardSubTitle, CTxButton, WithdrawnTitle, AmountTitle, CAlert, CMaxBtn } from '../common';
import { DepositInfo } from './DepositInfo';

export const DepositConsole: FC = () => {
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

  const tokenCurrencies = useMemo(() => {
    // TODO: Add currencyId type for native EDG token and other assets
    return [];
  }, []);

  // calculate current max assets amount according to current user balance
  const handleMax = useCallback(() => {
    if (!token.token) return;

    const tokenAmount = tokenBalance.toNumber();

    // TODO: Get max balance for the token type
  }, [setToken, tokenBalance, token]);

  return (
    <CardRoot>
      <CardTitle>Withdraw</CardTitle>
      <SpaceBox height={16} />
      <CardSubTitle>Select chain and the amount to withdraw</CardSubTitle>
      <SpaceBox height={24} />
      <Row gutter={[0, 24]}>
        <Col>
          <WithdrawnTitle>Withdraw Chain</WithdrawnTitle>
        </Col>
        <Col span={24}>
          <TokenInput currencies={tokenCurrencies} onChange={handleTokenCurrencyChange} value={token.token} />
        </Col>
        (
        <>
          <Col span={24}>
            <FlexBox justifyContent='space-between'>
              <AmountTitle>Deposit Note</AmountTitle>
              <CMaxBtn onClick={handleMax} type='ghost'>
                MAX
              </CMaxBtn>
            </FlexBox>
          </Col>
          <Col span={24}>
            <BalanceInput
              disabled={!token.token}
              error={tokenError}
              onChange={handleTokenAmountChange}
              showIcon={false}
              value={token}
            />
          </Col>
        </>
        <Col span={24}>
          <CTxButton method='deposit' onExtrinsicSuccsss={handleSuccess} params={params} section='mixer' size='large'>
            Withdraw
          </CTxButton>
        </Col>
      </Row>
    </CardRoot>
  );
};
