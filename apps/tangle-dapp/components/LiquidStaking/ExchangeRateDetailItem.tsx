import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingCurrency,
  LiquidStakingToken,
} from '../../constants/liquidStaking';
import useExchangeRate, {
  ExchangeRateType,
} from '../../data/liquidStaking/useExchangeRate';
import DetailItem from './DetailItem';

export type ExchangeRateDetailItemProps = {
  type: ExchangeRateType;
  token: LiquidStakingToken;
  currency: LiquidStakingCurrency;
};

const ExchangeRateDetailItem: FC<ExchangeRateDetailItemProps> = ({
  type,
  token,
  currency,
}) => {
  const exchangeRate = useExchangeRate(type, currency);

  const exchangeRateElement =
    exchangeRate === null ? (
      <SkeletonLoader className="w-[50px]" />
    ) : (
      exchangeRate
    );

  return (
    <DetailItem
      title="Rate"
      value={
        <div className="flex gap-1 items-center justify-center whitespace-nowrap">
          1 {token} = {exchangeRateElement} {LIQUID_STAKING_TOKEN_PREFIX}
          {token}
        </div>
      }
    />
  );
};

export default ExchangeRateDetailItem;
