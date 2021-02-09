import { tokenEq, TokenImage, TokenName, UserAssetBalance, UserAssetValue } from '@webb-dapp/react-components';
import { useBalance, useConstants } from '@webb-dapp/react-hooks';
import { Condition, ScrollCard, Tag } from '@webb-dapp/ui-components';
import { BareProps } from '@webb-dapp/ui-components/types';
import { CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC, ReactNode } from 'react';

import classes from './WalletBalance.module.scss';

interface BalanceProps extends BareProps {
  currency: CurrencyId;
}

export const Balance: FC<BalanceProps> = ({ className, currency }) => {
  const { liquidCurrency } = useConstants();
  const liquidBalance = useBalance(liquidCurrency);

  return (
    <div className={className}>
      <TokenImage className={classes.image} currency={currency} />
      <div className={classes.content}>
        <TokenName className={classes.name} currency={currency} />
        <UserAssetBalance className={classes.balance} currency={currency} />
        <Condition
          condition={tokenEq(currency, liquidCurrency)}
          or={<UserAssetValue className={classes.amount} currency={currency} />}
        ></Condition>
      </div>
    </div>
  );
};

export const WalletBalance: FC = () => {
  const { allCurrencies } = useConstants();

  return (
    <ScrollCard
      contentClassName={classes.cardContent}
      divider={false}
      header={
        <div className={classes.cardTitle}>
          <span>Wallet Balance</span>
          <Tag style='error' type='flag'>
            TestNet
          </Tag>
        </div>
      }
      itemClassName={classes.item}
      padding={false}
    >
      {allCurrencies.map(
        (currency: CurrencyId): ReactNode => (
          <ScrollCard.Item instance={<Balance currency={currency} />} key={`wallet-balance-${currency.toString()}`} />
        )
      )}
    </ScrollCard>
  );
};
