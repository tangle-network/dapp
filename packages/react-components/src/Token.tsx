import React, { FC } from 'react';
import clsx from 'clsx';

import { CurrencyId } from '@webb-tools/types/interfaces/primitives';

import { BareProps } from '@webb-dapp/ui-components/types';
import { Condition } from '@webb-dapp/ui-components';

import classes from './Token.module.scss';
import { getTokenImage, getTokenName, getTokenFullName } from './utils';

interface TokenComponentProps extends BareProps {
  currency?: CurrencyId;
}

function getTokensNameFromDexShare(currency: CurrencyId): [string, string] {
  if (!currency.isDexShare) {
    console.warn('should use dex share type currency is getTokensNameFromDexShare');

    return [currency.toString(), currency.toString()];
  }

  // sort ausd to tail
  return [currency.asDexShare[0].toString(), currency.asDexShare[1].toString()].sort((i) =>
    i === 'AUSD' ? 1 : -1
  ) as [string, string];
}

/**
 * @name TokenImage
 * @descript show token image
 * @param currency
 */
export const TokenImage: FC<TokenComponentProps> = ({ className, currency }) => {
  if (!currency) return null;

  // handle token
  if (currency.isToken) {
    return <img className={clsx(className, classes.tokenImage)} src={getTokenImage(currency.asToken.toString())} />;
  }

  // handle dex share
  if (currency.isDexShare) {
    const data = getTokensNameFromDexShare(currency);

    return (
      <div className={clsx(className, classes.lpImages)}>
        {data.map((item) => (
          <img className={clsx(classes.tokenImage)} key={`currency-${item}`} src={getTokenImage(item)} />
        ))}
      </div>
    );
  }

  return null;
};

/**
 * @name TokenName
 * @descript show token name
 * @param currency
 */
export const TokenName: FC<{ currency: CurrencyId | string } & BareProps> = ({ className, currency }) => {
  if (!currency) return null;

  if (typeof currency === 'string') return <span className={className}>{currency}</span>;

  if (currency.isToken) {
    return <span className={className}>{getTokenName(currency.asToken.toString())}</span>;
  }

  if (currency.isDexShare) {
    const data = getTokensNameFromDexShare(currency);

    return <span className={className}>{`${getTokenName(data[0])}-${getTokenName(data[1])}`}</span>;
  }

  return null;
};

/**
 * @name TokenFullName
 * @descript show token full name
 * @param currency
 */
export const TokenFullName: FC<TokenComponentProps> = ({ className, currency }) => {
  if (!currency) return null;

  if (currency.isToken) {
    return <span className={className}>{getTokenFullName(currency.asToken.toString())}</span>;
  }

  if (currency.isDexShare) {
    const data = getTokensNameFromDexShare(currency);

    return <span className={className}>{`${getTokenFullName(data[0])} / ${getTokenFullName(data[1])}`}</span>;
  }

  return null;
};

export interface TokenProps extends BareProps {
  currency: CurrencyId;
  imageClassName?: string;
  nameClassName?: string;
  fullnameClassName?: string;
  icon?: boolean;
  name?: boolean;
  fullname?: boolean;
  upper?: boolean;
  padding?: boolean;
}

export const Token: FC<TokenProps> = ({
  className,
  currency,
  fullname = false,
  fullnameClassName,
  icon = false,
  imageClassName,
  name = true,
  nameClassName,
  padding = false,
}) => {
  if (!currency) return null;

  return (
    <div
      className={clsx(classes.root, className, {
        [classes.padding]: padding,
      })}
    >
      <Condition
        condition={!!icon}
        match={<TokenImage className={clsx(classes.icon, imageClassName)} currency={currency} />}
      />
      <div className={classes.nameArea}>
        <Condition
          condition={name}
          match={<TokenName className={clsx(classes.name, nameClassName)} currency={currency} />}
        />
        <Condition
          condition={fullname}
          match={<TokenFullName className={clsx(classes.fullname, fullnameClassName)} currency={currency} />}
        />
      </div>
    </div>
  );
};
