import { useMemo, useEffect, useState } from 'react';

import { DerivedUserLoan, DerivedLoanType, DerivedLoanOverView } from '@acala-network/api-derive';
import { LoanHelper, Fixed18, debitToStableCoin, convertToFixed18 } from '@acala-network/app-util';
import { Rate, CurrencyId, Position } from '@acala-network/types/interfaces';

import { CurrencyLike, AccountLike } from './types';
import { useAccounts } from './useAccounts';
import { useCall } from './useCall';
import { useConstants } from './useConstants';
import { usePrice, useAllPrices } from './priceHooks';
import { filterEmptyLoan } from './utils';
import { useApi } from './useApi';
import { combineLatest, Observable } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';
import { tokenEq, focusToFixed18, getTokenName } from '@webb-dapp/react-components';

/**
 * @name useUserLoan
 * @description get user loan information
 */
export const useUserLoan = (currency: CurrencyLike, account?: AccountLike): DerivedUserLoan | undefined => {
  const { active } = useAccounts();
  const _account = account || (active ? active.address : '');
  const loan = useCall<DerivedUserLoan>('derive.loan.loan', [_account, currency]);

  return loan;
};

/**
 * @name useLoanType
 * @description get cdp type information
 */
export const useLoanType = (currency: CurrencyLike): DerivedLoanType | undefined => {
  const type = useCall<DerivedLoanType>('derive.loan.loanType', [currency]);

  return type;
};

/**
 * @name useAllLoanTyep
 * @description get all loan type
 */
export const useAllLoansType = (): Record<string, DerivedLoanType> | undefined => {
  const { api } = useApi();
  const { loanCurrencies } = useConstants();
  const [data, setData] = useState<Record<string, DerivedLoanType> | undefined>();

  useEffect(() => {
    const subscriber = combineLatest(loanCurrencies.map((currency) => {
      return (api.derive as any).loan.loanType(currency) as Observable<DerivedLoanType>;
    })).pipe(throttleTime(1000)).subscribe((result) => {
      setData(result.reduce((acc, cur, index) => {
        const currency = loanCurrencies[index];

        acc[getTokenName(currency)] = cur;

        return acc;
      }, {} as Record<string, DerivedLoanType>));
    });

    return (): void => subscriber.unsubscribe();
  }, [api, loanCurrencies, setData]);

  return data;
};

/**
 * @name useLoanHelper
 * @description get user loan helper object
 */
export const useLoanHelper = (currency: CurrencyId, account?: AccountLike): LoanHelper | null => {
  const { stableCurrency } = useConstants();
  const loan = useUserLoan(currency, account);
  const type = useLoanType(currency);
  const stableCurrencyPrice = usePrice(stableCurrency);
  const loanCurrencyPrice = usePrice(currency);
  const helper = useMemo((): LoanHelper | null => {
    if (!loan || !type || !stableCurrencyPrice || !loanCurrencyPrice) {
      return null;
    }

    return new LoanHelper({
      collateralPrice: focusToFixed18(loanCurrencyPrice),
      collaterals: loan.collateral,
      debitExchangeRate: type.debitExchangeRate,
      debits: loan.debit,
      expectedBlockTime: type.expectedBlockTime.toNumber(),
      globalStableFee: type.globalStabilityFee,
      liquidationRatio: type.liquidationRatio,
      requiredCollateralRatio: type.requiredCollateralRatio,
      stableCoinPrice: focusToFixed18(stableCurrencyPrice),
      stableFee: type.stabilityFee
    });
  }, [loan, loanCurrencyPrice, stableCurrencyPrice, type]);

  return helper;
};

/**
 * @name useAllUserLoans
 * @description get all the user loans
 * @param1 {boolean} [filterEmpty] when filterEmpyt is true, the result will drop empty loan
 */
export const useAllUserLoans = (filterEmpyt?: boolean, account?: AccountLike): DerivedUserLoan[] | null => {
  const { active } = useAccounts();
  const _account = account || (active ? active.address : '');
  const loans = useCall<DerivedUserLoan[]>('derive.loan.allLoans', [_account]);

  if (!loans) {
    return null;
  }

  return filterEmpyt ? filterEmptyLoan(loans) : loans;
};

/**
 * @name useLoanOverview
 * @description get loan overview
 */
export const useLoanOverview = (currency: CurrencyLike): (DerivedLoanOverView & DerivedLoanType) | undefined => {
  const result = useCall<DerivedLoanOverView>('derive.loan.loanOverview', [currency]);
  const loanType = useLoanType(currency);

  if (!result || !loanType) return undefined;

  return { ...result, ...loanType };
};

/**
 * @name useDebitToStable
 * @description convert debit to stable
 * @param [Fixed18] amount
 * @param [Fixed18] currency
 */
export const useDebitToStable = (amount: Fixed18, currency: CurrencyLike): Fixed18 => {
  const type = useLoanType(currency);

  const result = useMemo<Fixed18>(() => {
    if (!type || !amount || !amount.isZero()) return Fixed18.ZERO;

    return debitToStableCoin(amount, convertToFixed18(type.debitExchangeRate));
  }, [amount, type]);

  return result;
};

export interface TotalDebitOrCollateralData {
  amount: Fixed18;
  amountDetail: Map<CurrencyLike, Fixed18>;
  balanceDetail: Map<CurrencyLike, Fixed18>;
}

export const useTotalDebit = (): TotalDebitOrCollateralData | null => {
  const { api } = useApi();
  const { loanCurrencies } = useConstants();
  const prices = useAllPrices();
  const [result, setResult] = useState<TotalDebitOrCollateralData | null>(null);

  useEffect(() => {
    if (!api || !loanCurrencies || !prices) return;

    const subscriber = combineLatest(
      loanCurrencies.map((currency: CurrencyLike): Observable<[Fixed18, Fixed18, CurrencyLike]> => api.queryMulti<[Position, Rate]>([
        [api.query.loans.totalPositions, currency],
        [api.query.cdpEngine.debitExchangeRate, currency]
      ]).pipe(
        throttleTime(1000),
        map((result): [Fixed18, Fixed18, CurrencyLike] => [convertToFixed18(result[0].debit), convertToFixed18(result[1]), currency])))
    ).subscribe((_result) => {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const balanceDetail = new Map(_result.map(([debit, rate, currency]): [CurrencyLike, Fixed18] => {
        return [currency, debit];
      }));

      const amountDetail = new Map(_result.map(([debit, rate, currency]) => {
        return [currency, rate ? debit.mul(rate) : Fixed18.ZERO];
      }));

      const amount = _result.reduce((acc, cur) => {
        const [_debit, _rate] = cur;

        return _rate ? acc.add(_debit.mul(_rate)) : acc;
      }, Fixed18.ZERO);

      setResult({ amount, amountDetail, balanceDetail });
    });

    return (): void => subscriber.unsubscribe();
  }, [api, prices, loanCurrencies]);

  return result;
};

export const useTotalCollateral = (): TotalDebitOrCollateralData | null => {
  const { api } = useApi();
  const { loanCurrencies } = useConstants();
  const prices = useAllPrices();
  const [result, setResult] = useState<TotalDebitOrCollateralData | null>(null);

  useEffect(() => {
    if (!api || !loanCurrencies || !prices) return;

    const subscriber = combineLatest(
      loanCurrencies.map((currency: CurrencyLike): Observable<[CurrencyLike, Fixed18]> => {
        return api.query.loans.totalPositions<Position>(currency).pipe(
          map((result): [CurrencyLike, Fixed18] => [currency, convertToFixed18(result.collateral)])
        );
      })
    ).pipe(throttleTime(1000)).subscribe((_result) => {
      const balanceDetail = new Map(_result);

      const amountDetail = new Map(_result.map(([currency, collateral]) => {
        const price = prices.find((item): boolean => tokenEq(item.currency, currency));

        return [currency, price ? collateral.mul(focusToFixed18(price.price)) : Fixed18.ZERO];
      }));

      const amount = _result.reduce((acc, cur) => {
        const [currency, collateral] = cur;
        const price = prices.find((item): boolean => tokenEq(item.currency, currency));

        return price ? acc.add(collateral.mul(focusToFixed18(price.price))) : acc;
      }, Fixed18.ZERO);

      setResult({
        amount,
        amountDetail,
        balanceDetail
      });
    });

    return (): void => subscriber.unsubscribe();
  }, [api, prices, loanCurrencies]);

  return result;
};
