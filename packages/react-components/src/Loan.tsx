import React, { FC, useMemo } from 'react';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { FormatNumberProps, FormatRatio, FormatBalanceProps, FormatBalance } from './format';
import { useLoanHelper, useConstants, useLoanType, useLoanOverview, usePrice } from '@webb-dapp/react-hooks';
import { convertToFixed18, Fixed18 } from '@webb-tools/app-util';
import { CurrencyId } from '@webb-tools/types/interfaces';

type LoanPropertyProps<T> = T & {
  currency: CurrencyId;
};

export const CollateralRate: FC<LoanPropertyProps<Omit<FormatNumberProps, 'data'>>> = ({ currency, ...other }) => {
  const helper = useLoanHelper(currency);

  if (!helper) {
    return null;
  }

  return <FormatRatio {...other}
    data={helper.collateralRatio} />;
};

export const StableFeeAPR: FC<LoanPropertyProps<Omit<FormatNumberProps, 'data'>>> = ({ currency, ...other }) => {
  const helper = useLoanHelper(currency);

  if (!helper) {
    return null;
  }

  return <FormatRatio {...other}
    data={helper.stableFeeAPR} />;
};

export const RequiredCollateralRatio: FC<LoanPropertyProps<Omit<FormatNumberProps, 'data'>>> = ({
  currency,
  ...other
}) => {
  const type = useLoanType(currency);

  if (!type) {
    return null;
  }

  return <FormatRatio {...other}
    data={convertToFixed18(type.requiredCollateralRatio)} />;
};

export const LiquidationRatio: FC<LoanPropertyProps<Omit<FormatNumberProps, 'data'>>> = ({ currency, ...other }) => {
  const type = useLoanType(currency);

  if (!type) {
    return null;
  }

  return <FormatRatio {...other}
    data={convertToFixed18(type.liquidationRatio)} />;
};

export const LiquidationPenalty: FC<LoanPropertyProps<Omit<FormatNumberProps, 'data'>>> = ({ currency, ...other }) => {
  const type = useLoanType(currency);

  if (!type) {
    return null;
  }

  return <FormatRatio {...other}
    data={convertToFixed18(type.liquidationPenalty)} />;
};

export const Collateral: FC<LoanPropertyProps<FormatBalanceProps>> = ({ currency, ...other }) => {
  const helper = useLoanHelper(currency);

  if (!helper) {
    return null;
  }

  return <FormatBalance {...other}
    balance={convertToFixed18(helper.collaterals)}
    currency={currency} />;
};

export const DebitAmount: FC<LoanPropertyProps<FormatBalanceProps>> = ({ currency, ...other }) => {
  const { stableCurrency } = useConstants();
  const helper = useLoanHelper(currency);

  if (!helper) {
    return null;
  }

  return <FormatBalance {...other}
    balance={helper.debitAmount}
    currency={stableCurrency} />;
};

export const TotalCollateral: FC<LoanPropertyProps<FormatBalanceProps>> = ({ currency, ...other }) => {
  const overview = useLoanOverview(currency);

  if (!overview) return null;

  return <FormatBalance {...other}
    balance={convertToFixed18(overview.totalCollateral)}
    currency={currency} />;
};

export const TotalDebit: FC<LoanPropertyProps<FormatBalanceProps>> = ({ currency, ...other }) => {
  const overview = useLoanOverview(currency);
  const { stableCurrency } = useConstants();
  const result = useMemo<Fixed18>(() => {
    if (!overview) return Fixed18.ZERO;

    if (!overview.totalDebit || !overview.debitExchangeRate) return Fixed18.ZERO;

    return convertToFixed18(overview.totalDebit).mul(convertToFixed18(overview.debitExchangeRate));
  }, [overview]);

  if (!overview) return null;

  return <FormatBalance {...other}
    balance={result}
    currency={stableCurrency} />;
};

export const TotalCollateralRatio: FC<LoanPropertyProps<Omit<FormatNumberProps, 'data'>>> = ({
  currency,
  ...other
}) => {
  const overview = useLoanOverview(currency);
  const price = usePrice(currency);
  const result = useMemo<FixedPointNumber>(() => {
    if (!overview || !price) return FixedPointNumber.ZERO;

    if (!overview.totalDebit || !overview.debitExchangeRate || !overview.totalCollateral) return FixedPointNumber.ZERO;

    const totalCollateralValue = FixedPointNumber.fromInner(overview.totalCollateral.toString()).times(price);
    const totalDebitValue = FixedPointNumber.fromInner(overview.totalDebit.toString()).times(
      FixedPointNumber.fromInner(overview.debitExchangeRate.toString())
    );

    return totalCollateralValue.div(totalDebitValue);
  }, [overview, price]);

  if (!overview) return null;

  return <FormatRatio {...other}
    data={result} />;
};
