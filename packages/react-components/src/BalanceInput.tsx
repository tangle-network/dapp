import React, { FC, FocusEventHandler, useState, ReactNode, useCallback, useMemo } from 'react';
import { FormikErrors } from 'formik';

import { CurrencyId } from '@webb-tools/types/interfaces';
import { BareProps } from '@webb-dapp/ui-components/types';
import {
  Button,
  NumberInput,
  NumberInputProps,
  styled,
  getInputShadow,
  getInputBorder,
} from '@webb-dapp/ui-components';

import { TokenName } from './Token';
import { TokenSelector } from './TokenSelector';

type BalanceInputSize = 'large' | 'middle' | 'small' | 'mini';

export type BalanceInputValue = {
  amount: number;
  token: CurrencyId;
};

export const BalanceInputRoot = styled.div<{
  error: boolean;
  focused: boolean;
  noBorder: boolean;
}>`
  position: relative;
  display: flex;
  align-items: stretch;
  padding: 0;
  padding-left: 16px;
  height: 58px;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  border-radius: 2px;
  border: ${({ error, noBorder }): string => getInputBorder(noBorder, error)};
  box-shadow: ${({ error, focused, noBorder }): string => getInputShadow(noBorder, error, focused)};

  &:hover {
    box-shadow: ${({ error, noBorder }): string => getInputShadow(noBorder, error, true)};
  }
`;

const CNumberInput = styled(NumberInput)`
  flex: 1 1 auto;
  padding: none;
`;

const MaxBtn = styled(Button)`
  height: auto;
  min-width: auto;
  font-size: 14px;
  font-weight: bold;
`;

const Currency = styled.div<{ icon: boolean }>`
  display: flex;
  align-items: center;
  line-height: 100%;
  color: var(--color-primary);
  padding-right: 16px;
  font-size: 18px;

  .balance-input__icon {
    width: 24px;
    height: 24px;
  }

  .balance-input__currency {
    white-space: nowrap;
  }
`;

const Error = styled.div<{ show: boolean }>`
  opacity: ${({ show }): number => (show ? 1 : 0)};
  position: absolute;
  box-sizing: border-box;
  top: -36px;
  right: 0;
  padding: 4px 8px;
  background: var(--color-error);
  border-radius: 4px;
  font-size: 12px;
  line-height: 16px;
  color: #ffffff;
  font-weight: 500;

  &:after {
    position: absolute;
    content: '';
    width: 0;
    height: 0;
    bottom: -4px;
    right: 18px;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid var(--color-error);
  }
`;

export interface BalanceInputProps extends BareProps {
  disableZeroBalance?: boolean;
  selectableTokens?: CurrencyId[];
  disableTokens?: CurrencyId[];
  enableTokenSelect?: boolean;
  error?: string | string[] | FormikErrors<any> | FormikErrors<any>[];
  disabled?: boolean;
  onChange?: (value: Partial<BalanceInputValue>) => void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  value?: Partial<BalanceInputValue>;
  tokenPosition?: 'left' | 'right';
  showIcon?: boolean;
  size?: BalanceInputSize;
  min?: number;
  max?: number;
  onMax?: () => void;
  numberInputProps?: Partial<NumberInputProps>;
  noBorder?: boolean;
}

export const BalanceInput: FC<BalanceInputProps> = ({
  disableZeroBalance = true,
  className,
  disabled = false,
  disableTokens = [],
  enableTokenSelect = false,
  error,
  max,
  min,
  numberInputProps,
  noBorder = false,
  onBlur,
  onChange,
  onFocus,
  onMax,
  placeholder,
  selectableTokens = [],
  showIcon = true,
  tokenPosition = 'right',
  value,
}) => {
  const [focused, setFocused] = useState<boolean>(false);
  const showMaxBtn = useMemo(() => !!onMax, [onMax]);

  const onTokenChange = useCallback(
    (token: CurrencyId) => {
      if (!onChange) return;

      if (!value) return;

      onChange({ amount: value.amount || 0, token });
    },
    [onChange, value]
  );

  const onValueChange = useCallback(
    (amount: number) => {
      if (!onChange) return;

      if (!value) return;

      onChange({ amount, token: value.token });
    },
    [onChange, value]
  );

  const renderToken = useCallback((): ReactNode => {
    if (enableTokenSelect) {
      return (
        <TokenSelector
          checkBalance={disableZeroBalance}
          currencies={selectableTokens}
          disabledCurrencies={disableTokens}
          onChange={onTokenChange}
          showIcon={showIcon}
          value={value?.token}
        />
      );
    }

    return (
      <Currency icon={showIcon}>
        <TokenName className='balance-input__currency' currency={value?.token || ''} />
      </Currency>
    );
  }, [value, disableTokens, enableTokenSelect, onTokenChange, selectableTokens, showIcon, disableZeroBalance]);

  const _onFocus: FocusEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setFocused(true);
      onFocus && onFocus(event);
    },
    [setFocused, onFocus]
  );

  const _onBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setFocused(false);
      onBlur && onBlur(event);
    },
    [setFocused, onBlur]
  );

  return (
    <BalanceInputRoot className={className} error={!!error} focused={focused} noBorder={noBorder}>
      {tokenPosition === 'left' ? renderToken() : null}
      <CNumberInput
        className='balance-input__input'
        disabled={disabled}
        max={max}
        min={min}
        onBlur={_onBlur}
        onChange={onValueChange}
        onFocus={_onFocus}
        placeholder={placeholder}
        value={value?.amount}
        {...numberInputProps}
      />
      {showMaxBtn ? (
        <MaxBtn onClick={onMax} type='ghost'>
          MAX
        </MaxBtn>
      ) : null}
      {tokenPosition === 'right' ? renderToken() : null}
      <Error show={!!error}>{error}</Error>
    </BalanceInputRoot>
  );
};
