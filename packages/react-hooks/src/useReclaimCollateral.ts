import { FixedPointNumber } from '@acala-network/sdk-core';
import { Balance } from '@open-web3/orml-types/interfaces';

import { useConstants } from './useConstants';
import { useCallback, useMemo } from 'react';
import { useCall } from './useCall';
import { WithNull } from './types';
import { useTreasuryOverview } from './treasuryHooks';

type ReclaimCollateralAmount = Record<string, FixedPointNumber>;

export interface ReclaimCollateralData {
  collaterals: WithNull<ReclaimCollateralAmount>;
  calcCanReceive: (amount: FixedPointNumber) => ReclaimCollateralAmount;
}

export const useReclaimCollateral = (): ReclaimCollateralData => {
  const { stableCurrency } = useConstants();
  const treasury = useTreasuryOverview();
  const totalIssuance = useCall<Balance>('query.tokens.totalIssuance', [stableCurrency]);

  const collaterals = useMemo<ReclaimCollateralAmount>(() => {
    if (!treasury) return {};

    return treasury.totalCollaterals.reduce((acc, cur) => {
      acc[cur.currency.asToken.toString()] = cur.balance;

      return acc;
    }, {} as ReclaimCollateralAmount);
  }, [treasury]);

  const calcCanReceive = useCallback((amount: FixedPointNumber): ReclaimCollateralAmount => {
    if (!totalIssuance || !collaterals) {
      return {};
    }

    const ratio = amount.div(FixedPointNumber.fromInner(totalIssuance.toString()));

    return Object.keys(collaterals).reduce((acc, currency) => {
      acc[currency] = (collaterals[currency] || FixedPointNumber.ZERO).times(ratio);

      return acc;
    }, {} as ReclaimCollateralAmount);
  }, [totalIssuance, collaterals]);

  return {
    calcCanReceive,
    collaterals
  };
};
