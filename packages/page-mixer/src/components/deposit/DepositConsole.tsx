import React, { FC, useCallback, useMemo, useEffect } from 'react';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces';

import { Row, Col, FlexBox, SpaceBox } from '@webb-dapp/ui-components';
import { useLP, useBalance, useBalanceValidator, useLPEnabledCurrencies } from '@webb-dapp/react-hooks';
import { BalanceInput, BalanceInputValue, tokenEq, eliminateGap, Token } from '@webb-dapp/react-components';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { TokenInput } from '@webb-dapp/react-components/TokenInput';

import { CardRoot, CardTitle, CardSubTitle, CTxButton, WithdrawnTitle, AmountTitle, CAlert, CMaxBtn } from '../common';
import { DepositInfo } from './DepositInfo';

export const DepositConsole: FC = () => {
  const lpEnableCurrencies = useLPEnabledCurrencies();

  const [token1, setToken1, { error: token1Error, setValidator: setToken1Validator }] = useInputValue<
    BalanceInputValue
  >({ amount: 0 });

  const [token2, setToken2, { error: token2Error, setValidator: setToken2Validator }] = useInputValue<
    Partial<BalanceInputValue>
  >({ amount: 0 });

  const token1Currencies = useMemo(() => {
    if (!token2.token) return lpEnableCurrencies;

    return lpEnableCurrencies.filter((item) => !tokenEq(item, (token2.token as any) as CurrencyId));
  }, [token2.token, lpEnableCurrencies]);

  const token2Currencies = useMemo(() => {
    if (!token1.token) return lpEnableCurrencies;

    return lpEnableCurrencies.filter((item) => !tokenEq(item, (token1.token as any) as CurrencyId));
  }, [token1.token, lpEnableCurrencies]);

  const { availableLP: isAvailableLP, getAddLPSuggestAmount, lpCurrencyId } = useLP(token1.token, token2.token);

  useBalanceValidator({
    currency: token1.token,
    updateValidator: setToken1Validator
  });

  useBalanceValidator({
    currency: token2.token,
    updateValidator: setToken2Validator
  });

  const clearAmount = useCallback(() => {
    setToken1({ amount: 0 });
    setToken2({ amount: 0 });
  }, [setToken2, setToken1]);

  const handleToken1CurrencyChange = useCallback(
    (currency: CurrencyId) => {
      setToken1({ token: currency });
      clearAmount();
    },
    [setToken1, clearAmount]
  );

  const handleToken2CurrencyChange = useCallback(
    (currency: CurrencyId) => {
      setToken2({ token: currency });
      clearAmount();
    },
    [setToken2, clearAmount]
  );

  const token1Balance = useBalance(token1.token);
  const token2Balance = useBalance(token2.token);

  const params = useCallback(() => {
    // ensure that this must be checked by isDisabled
    if (!token1.token || !token1.amount) return [];
    if (!token2.token || !token2.amount) return [];

    return [
      token1.token,
      token2.token,
      eliminateGap(new FixedPointNumber(token1.amount), token1Balance).toChainData(),
      eliminateGap(new FixedPointNumber(token2.amount), token2Balance).toChainData()
    ];
  }, [token1, token2, token1Balance, token2Balance]);

  // calculate current max assets amount according to current user balance
  const handleMax = useCallback(() => {
    if (!isAvailableLP || !token1.token || !token2.token) return;

    const token1Amount = token1Balance.toNumber();
    const token2Amount = token2Balance.toNumber();

    const suggestToken2ByToken1 = getAddLPSuggestAmount(token1.token, token1Amount);
    const suggestToken1ByToken2 = getAddLPSuggestAmount(token2.token, token2Amount);

    if (suggestToken2ByToken1.isZero() || suggestToken1ByToken2.isZero()) return;

    if (suggestToken2ByToken1.isGreaterThan(token2Balance)) {
      setToken1({ amount: suggestToken1ByToken2.toNumber() });
      setToken2({ amount: token2Balance.toNumber() });
    } else {
      setToken1({ amount: token1Balance.toNumber() });
      setToken2({ amount: suggestToken2ByToken1.toNumber() });
    }
  }, [setToken1, setToken2, token1Balance, token2Balance, token1, token2, getAddLPSuggestAmount, isAvailableLP]);

  // when the values is not availableLP or inputs are wrong, disable the tx button
  const isDisable = useMemo(() => {
    if (!isAvailableLP) return true;

    return !(token1.amount && token2.amount && !token1Error && !token2Error);
  }, [isAvailableLP, token1, token2, token1Error, token2Error]);

  const handleSuccess = useCallback(() => {
    clearAmount();
  }, [clearAmount]);

  const handleToken1AmountChange = useCallback(
    ({ amount, token }: Partial<BalanceInputValue>) => {
      setToken1({ amount });

      if (!token || !amount) {
        setToken2({ amount: 0 });

        return;
      }

      setToken2({
        amount: getAddLPSuggestAmount(token, amount).toNumber()
      });
    },
    [setToken1, setToken2, getAddLPSuggestAmount]
  );

  const handleToken2AmountChange = useCallback(
    ({ amount, token }: Partial<BalanceInputValue>) => {
      setToken2({ amount });

      if (!token || !amount) {
        setToken1({ amount: 0 });

        return;
      }

      setToken1({
        amount: getAddLPSuggestAmount(token, amount).toNumber()
      });
    },
    [setToken1, setToken2, getAddLPSuggestAmount]
  );

  // clear amount when lp is not available
  useEffect(() => {
    if (!isAvailableLP) {
      clearAmount();
    }
  }, [isAvailableLP, clearAmount]);

  return (
    <CardRoot>
      <CardTitle>Add Liquidity</CardTitle>
      <SpaceBox height={16} />
      <CardSubTitle>Add liquidity to a pool and get LP tokens of the pair.</CardSubTitle>
      <SpaceBox height={24} />
      <Row gutter={[0, 24]}>
        <Col>
          <WithdrawnTitle>Withdraw Token 1</WithdrawnTitle>
        </Col>
        <Col span={24}>
          <TokenInput currencies={token1Currencies} onChange={handleToken1CurrencyChange} value={token1.token} />
        </Col>
        <Col>
          <WithdrawnTitle>Withdraw Token 2</WithdrawnTitle>
        </Col>
        <Col span={24}>
          <TokenInput currencies={token2Currencies} onChange={handleToken2CurrencyChange} value={token2.token} />
        </Col>
        {!isAvailableLP && lpCurrencyId ? (
          <Col span={24}>
            <CAlert
              icon={null}
              message={
                <>
                  <Token currency={lpCurrencyId} icon={true} />
                  <span>is not an available liquidity pool.</span>
                </>
              }
              type='error'
            />
          </Col>
        ) : token1.token && token2.token ? (
          <>
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
                disabled={!(token1.token && isAvailableLP)}
                error={token1Error}
                onChange={handleToken1AmountChange}
                showIcon={false}
                value={token1}
              />
            </Col>
            <Col span={24}>
              <BalanceInput
                disabled={!(token2.token && isAvailableLP)}
                error={token2Error}
                onChange={handleToken2AmountChange}
                showIcon={false}
                value={token2}
              />
            </Col>
          </>
        ) : null}
        {isAvailableLP && token1.token && token2.token ? (
          <Col span={24}>
            <DepositInfo token1={(token1 as any) as BalanceInputValue} token2={(token2 as any) as BalanceInputValue} />
          </Col>
        ) : null}
        <Col span={24}>
          <CTxButton
            disabled={isDisable}
            method='addLiquidity'
            onExtrinsicSuccsss={handleSuccess}
            params={params}
            section='dex'
            size='large'
          >
            Add Liquidty
          </CTxButton>
        </Col>
      </Row>
    </CardRoot>
  );
};
