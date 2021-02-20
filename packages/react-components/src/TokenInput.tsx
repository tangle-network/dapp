import { useBalance } from '@webb-dapp/react-hooks';
import { ArrowPixelIcon, styled } from '@webb-dapp/ui-components';
import { BareProps } from '@webb-dapp/ui-components/types';
import { CurrencyId } from '@webb-tools/types/interfaces';
import { Dropdown, Menu } from 'antd';
import React, { FC, FocusEventHandler, useCallback, useState } from 'react';

import { BalanceInputRoot } from './BalanceInput';
import { Token } from './Token';

interface TokenInputProps extends BareProps {
  error?: string;
  currencies: CurrencyId[];
  value?: CurrencyId;
  onChange?: (value: CurrencyId) => void;
  placeholder?: string;
  disableZeroCurrency?: boolean;
}

interface CurrencyItemProps {
  currency: CurrencyId;
  disableZeroCurrency?: boolean;
  onClick?: (value: CurrencyId) => void;
}

const MenuItem = styled(Menu.Item)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;

  .token-input__menu__item__currency,
  .token-input__menu__item__balance {
    font-size: 18px;
    line-height: 1.2083;
    color: #333333;
  }
`;

const Current = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
  padding: 0 16px;

  .token-input__menu__item__currency,
  .token-input__menu__item__balance {
    font-size: 18px;
    line-height: 1.2083;
    color: #333333;
  }
`;

const CurrencyItem: FC<CurrencyItemProps> = ({ currency, disableZeroCurrency, onClick, ...props }) => {
  const balance = useBalance(currency);
  const _onClick = useCallback(() => {
    console.log(onClick);
    if (onClick) {
      onClick(currency);
    }
  }, [onClick, currency]);

  return (
    <MenuItem
      {...props}
      className='token-input__menu__item'
      // disabled={disableZeroCurrency ? balance.isZero() : false}
      key={`token-input-${currency.toString()}`}
      onClick={_onClick}
    >
      <Token className='token-input__menu__item__currency' currency={currency} icon />
      {/* <UserBalance className='token-input__menu__item__balance' currency={currency} showCurrencyName /> */}
    </MenuItem>
  );
};

export const TokenInput: FC<TokenInputProps> = styled<FC<TokenInputProps>>(
  ({ className, currencies, disableZeroCurrency = true, error, onChange, placeholder, value }) => {
    const [focused, setFocused] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    console.log('token', value);
    const onFocus: FocusEventHandler<HTMLElement> = useCallback(() => {
      setFocused(true);
    }, [setFocused]);

    const onBlur: FocusEventHandler<HTMLElement> = useCallback(() => {
      setFocused(false);
    }, [setFocused]);

    const _onClick = useCallback(
      (currency: CurrencyId) => {
        if (onChange) {
          onChange(currency);
        }

        setVisible(false);
      },
      [onChange]
    );

    return (
      <BalanceInputRoot
        className={className}
        error={!!error}
        focused={focused}
        noBorder={false}
        onBlur={onBlur}
        onFocus={onFocus}
      >
        <Dropdown
          onVisibleChange={setVisible}
          overlay={
            <Menu className='token-input__menu'>
              {currencies.map((currency) => {
                return (
                  <CurrencyItem
                    currency={currency}
                    disableZeroCurrency={disableZeroCurrency}
                    key={`key-${currency.toString()}`}
                    onClick={_onClick}
                  />
                );
              })}
            </Menu>
          }
          trigger={['click']}
          visible={visible}
        >
          <div className='token-input__content'>
            {value ? (
              <Current>
                <Token className='token-input__menu__item__currency' currency={value} icon />
                {/* <UserBalance className='token-input__menu__item__balance' currency={value} showCurrencyName /> */}
              </Current>
            ) : (
              <div className='token-input__content__content'>{placeholder || 'Please Select Token'}</div>
            )}
            <div className='token-input__content__icon'>
              <ArrowPixelIcon />
            </div>
          </div>
        </Dropdown>
      </BalanceInputRoot>
    );
  }
)`
  display: block;
  height: 58px;
  padding: 0;
  user-select: none;

  .token-input__content__icon {
    position: relative;
    display: grid;
    place-items: center;

    & > svg {
      transform: rotate(90deg);
    }

    &:after {
      content: '';
      position: absolute;
      height: calc(100% - 16px);
      width: 1px;
      top: 8px;
      left: 0;
      background: var(--dividing-color);
    }
  }

  .token-input__content {
    display: grid;
    grid-template-columns: 1fr 58px;
    cursor: pointer;

    width: 100%;
    height: 100%;
  }

  .token-input__content__content {
    display: flex;
    align-items: center;
    padding: 0 16px;
    font-size: 16px;
    line-height: 1.1875;
  }
`;
