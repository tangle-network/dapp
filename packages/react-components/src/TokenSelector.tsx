import React, { FC, useState, useCallback, useMemo, ReactNode } from 'react';
import clsx from 'clsx';
import { noop } from 'lodash';

import { Menu, Dropdown } from 'antd';

import { BareProps } from '@webb-dapp/ui-components/types';
import { ArrowIcon } from '@webb-dapp/ui-components';
import { CurrencyId } from '@webb-tools/types/interfaces';
import { useBalance } from '@webb-dapp/react-hooks';

import { Token, TokenImage, TokenName } from './Token';
import { tokenEq } from './utils';
import { CurrencyChangeFN } from './types';
import classes from './TokenSelector.module.scss';
import { UserAssetBalance } from './Assets';

interface MenuItemProps {
  value?: CurrencyId;
  currency: CurrencyId;
  checkBalance: boolean;
  disabledCurrencies: CurrencyId[];
  onClick: (currency: CurrencyId) => void;
  [k: string]: any;
}

const MenuItem: FC<MenuItemProps> = ({ checkBalance, currency, disabledCurrencies, onClick, value, ...others }) => {
  // query currency balance
  const balance = useBalance(currency);

  // if currency in disabledCurrencies or balance is zero, disable this item
  const isDisabled = useMemo(() => {
    if (disabledCurrencies.find((item) => tokenEq(item, currency))) return true;

    if (checkBalance && balance && balance.isZero()) return true;

    return false;
  }, [currency, disabledCurrencies, balance, checkBalance]);

  const isActive = useMemo(() => value && tokenEq(currency, value), [currency, value]);

  return (
    <Menu.Item
      className={clsx(classes.item, { [classes.active]: isActive })}
      disabled={isDisabled}
      key={currency.toString()}
      onClick={(): void => onClick(currency)}
      {...others}
    >
      <TokenImage className={classes.tokenImage} currency={currency} />
      <div className={classes.tokenDetail}>
        <TokenName className={classes.tokenName} currency={currency} />
        <UserAssetBalance className={classes.assetBalance} currency={currency} />
      </div>
    </Menu.Item>
  );
};

interface Props extends BareProps {
  currencies: CurrencyId[];
  checkBalance?: boolean;
  disabledCurrencies?: CurrencyId[];
  value?: CurrencyId;
  onChange?: CurrencyChangeFN;
  showIcon?: boolean;
  showDetail?: boolean;
  valueRender?: (value: CurrencyId) => ReactNode;
}

export const TokenSelector: FC<Props> = ({
  className,
  currencies,
  checkBalance = true,
  disabledCurrencies = [],
  onChange = noop,
  value,
  showIcon,
  valueRender,
}) => {
  const [visible, setVisible] = useState<boolean>(false);

  const _onChange = useCallback(
    (currency: CurrencyId) => {
      if (onChange) {
        onChange(currency);
      }

      setVisible(false);
    },
    [onChange]
  );

  return (
    <Dropdown
      className={className}
      onVisibleChange={setVisible}
      overlay={
        <Menu
          style={{
            background: `var(--card-background)`,
          }}
        >
          {currencies.map((currency) => {
            return (
              <MenuItem
                checkBalance={checkBalance}
                currency={currency}
                disabledCurrencies={disabledCurrencies}
                key={`token-selector-${currency.toString()}`}
                onClick={_onChange}
                value={value}
              />
            );
          })}
        </Menu>
      }
      placement='bottomRight'
      trigger={['click']}
      visible={visible}
    >
      <div className={classes.selected}>
        {value ? (
          valueRender ? (
            valueRender(value)
          ) : (
            <Token className={classes.token} currency={value} icon={showIcon} />
          )
        ) : null}
        <ArrowIcon className={classes.arrow} />
      </div>
    </Dropdown>
  );
};
