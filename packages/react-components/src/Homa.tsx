import React, { FC, useMemo } from 'react';

import { useStakingPool, useConstants } from '@webb-dapp/react-hooks';

import { FormatBalance, BalancePair, FormatBalanceProps } from './format';
import { tokenEq } from './utils';
import { FixedPointNumber } from '@acala-network/sdk-core';

export interface StakingPoolExchangeRateProps extends FormatBalanceProps {
  stakingAmount?: FixedPointNumber;
  liquidAmount?: FixedPointNumber;
  showStakingAmount?: boolean;
  showLiquidAmount?: boolean;
}

export const StakingPoolExchangeRate: FC<StakingPoolExchangeRateProps> = ({
  className,
  liquidAmount,
  showLiquidAmount = true,
  showStakingAmount = true,
  stakingAmount
}) => {
  const stakingPool = useStakingPool();
  const { liquidCurrency, stakingCurrency } = useConstants();

  const tokenPair = useMemo<BalancePair[]>((): BalancePair[] => {
    if (!stakingPool) return [];

    let result = [];

    if (stakingAmount) {
      result = [
        { balance: stakingAmount, currency: stakingCurrency },
        { balance: stakingAmount.div(stakingPool.stakingPool.liquidExchangeRate()), currency: stakingCurrency }
      ];
    } else if (liquidAmount) {
      result = [
        { balance: liquidAmount, currency: liquidCurrency },
        { balance: liquidAmount.times(stakingPool.stakingPool.liquidExchangeRate()), currency: stakingCurrency }
      ];
    } else {
      result = [
        { balance: FixedPointNumber.ONE, currency: stakingCurrency },
        { balance: stakingPool.stakingPool.liquidExchangeRate(), currency: liquidCurrency }
      ];
    }

    return result.filter((item) => {
      if (showStakingAmount && tokenEq(item.currency, stakingCurrency)) {
        return true;
      }

      if (showLiquidAmount && tokenEq(item.currency, liquidCurrency)) {
        return true;
      }

      return false;
    });
  }, [stakingPool, stakingAmount, liquidAmount, liquidCurrency, stakingCurrency, showStakingAmount, showLiquidAmount]);

  return <FormatBalance className={className} pair={tokenPair} pairSymbol='≈' />;
};
