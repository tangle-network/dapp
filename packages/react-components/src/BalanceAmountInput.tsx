import React, { FC, useState, useMemo, FocusEventHandler, useCallback, useEffect } from 'react';
import clsx from 'clsx';

import { usePrice, useBalance, useConstants, useBalanceValidator } from '@webb-dapp/react-hooks';
import { SwitchIcon, Condition } from '@webb-dapp/ui-components';

import classes from './BalanceAmountInput.module.scss';
import { BalanceInput, BalanceInputValue } from './BalanceInput';
import { TokenName } from './Token';
import { FormatValue } from './format';
import { CurrencyId } from '@webb-tools/types/interfaces';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { LPAmountWithShare } from './LPSize';

type InputType = 'balance' | 'amount';

export interface BalanceAmountValue {
  balance: number;
  amount: number;
  error?: string;
}
export interface BalanceAmountInputProps {
  currency: CurrencyId;
  error?: string;
  mode?: 'token' | 'lp-token';
  onChange: (value: Partial<BalanceAmountValue>) => void;
}

export const BalanceAmountInput: FC<BalanceAmountInputProps> = ({ currency, error, mode = 'token', onChange }) => {
  const price = usePrice(currency);
  const balance = useBalance(currency);
  const { stableCurrency } = useConstants();
  const [inputType, _setInputType] = useState<InputType>('balance');
  const [focused, setFocused] = useState<boolean>(false);

  const setInputType = useCallback(
    (value: InputType) => {
      if (mode === 'lp-token') return;

      _setInputType(value);
    },
    [mode, _setInputType]
  );

  const maxAmount = useMemo(() => {
    if (!balance || !price) return FixedPointNumber.ZERO;

    return balance.times(price);
  }, [balance, price]);

  const [balanceValue, setBalanceValue, { error: balanceError, setValidator: setBalanceValidator }] = useInputValue<
    BalanceInputValue
  >({
    amount: 0,
    token: currency
  });

  const [amountValue, setAmountValue, { error: amountError, setValidator: setAmountValidator }] = useInputValue<
    BalanceInputValue
  >({
    amount: 0,
    token: currency
  });

  useBalanceValidator({
    currency: currency,
    updateValidator: setBalanceValidator
  });

  useBalanceValidator({
    checkBalance: false,
    currency: currency,
    max: [maxAmount, ''],
    updateValidator: setAmountValidator
  });

  const amountForBalance = useMemo(() => {
    if (!price) return FixedPointNumber.ZERO;

    return new FixedPointNumber(balanceValue.amount || 0).times(price);
  }, [price, balanceValue]);

  const balanceForAmount = useMemo(() => {
    if (!price) return FixedPointNumber.ZERO;
    if (!amountValue.amount) return FixedPointNumber.ZERO;

    return new FixedPointNumber(amountValue.amount).div(price);
  }, [price, amountValue]);

  const handleSwitch = useCallback(() => {
    if (mode === 'lp-token') return;

    setInputType(inputType === 'amount' ? 'balance' : 'amount');
    setBalanceValue({
      amount: 0,
      token: currency
    });
    setAmountValue({
      amount: 0,
      token: stableCurrency
    });
  }, [setInputType, inputType, setBalanceValue, setAmountValue, currency, stableCurrency, mode]);

  const handleFocus: FocusEventHandler<HTMLInputElement> = () => {
    setFocused(true);
  };

  const hanleBlur: FocusEventHandler<HTMLInputElement> = () => {
    setFocused(false);
  };

  const handleBalanceMax = useCallback(() => {
    if (!balance) return;

    setBalanceValue({
      amount: balance.toNumber(),
      token: currency
    });
    onChange({
      amount: balance.times(price).toNumber(),
      balance: balance.toNumber()
    });
  }, [setBalanceValue, balance, currency, onChange, price]);

  const handleAmountMax = useCallback(() => {
    setAmountValue({
      amount: maxAmount.toNumber() || 0,
      token: stableCurrency
    });
    onChange({
      amount: maxAmount.toNumber(),
      balance: maxAmount.div(price).toNumber()
    });
  }, [maxAmount, setAmountValue, price, onChange, stableCurrency]);

  const rootClasses = useMemo(() => {
    return clsx(classes.root, {
      [classes.focused]: focused,
      [classes.error]: !!error,
      [classes.noSwitch]: mode === 'lp-token'
    });
  }, [focused, error, mode]);

  useEffect(() => {
    onChange({
      amount: amountValue.amount,
      balance: balanceValue.amount,
      error: balanceError || amountError
    });
    /* eslint-disable-next-line */
  }, [balanceError, amountError, amountValue, balanceValue]);

  return (
    <div className={rootClasses}>
      {mode === 'token' ? (
        <div className={classes.switch} onClick={handleSwitch}>
          <SwitchIcon />
        </div>
      ) : null}
      <div className={classes.inputArea}>
        <Condition condition={inputType === 'balance'}>
          <BalanceInput
            className={classes.balanceInput}
            error={balanceError}
            noBorder={true}
            onBlur={hanleBlur}
            onChange={setBalanceValue}
            onFocus={handleFocus}
            onMax={handleBalanceMax}
            showIcon={false}
            size='small'
            value={balanceValue}
          />
          {mode === 'token' && balanceValue.token ? (
            <div className={classes.amountDisplay}>
              <FormatValue data={amountForBalance} />
              <TokenName currency={stableCurrency} />
            </div>
          ) : (
            <LPAmountWithShare
              className={classes.lpSize}
              lp={balanceValue.token as CurrencyId}
              share={balanceValue.amount as number}
            />
          )}
        </Condition>
        <Condition condition={inputType === 'amount'}>
          <BalanceInput
            className={classes.balanceInput}
            error={amountError}
            noBorder={true}
            onChange={setAmountValue}
            onMax={handleAmountMax}
            showIcon={false}
            size='small'
            value={amountValue}
          />
          <div className={classes.amountDisplay}>
            <FormatValue data={balanceForAmount} />
            <TokenName currency={currency} />
          </div>
        </Condition>
      </div>
    </div>
  );
};
