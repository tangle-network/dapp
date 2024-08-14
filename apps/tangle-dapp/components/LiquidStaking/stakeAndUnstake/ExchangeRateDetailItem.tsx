import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { ParachainCurrency } from '../../../constants/liquidStaking/liquidStakingParachain';
import { LST_PREFIX, LsToken } from '../../../constants/liquidStaking/types';
import useExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useExchangeRate';
import DetailItem from './DetailItem';

export type ExchangeRateDetailItemProps = {
  type: ExchangeRateType;
  token: LsToken;
  currency: ParachainCurrency;
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
          1 {token} = {exchangeRateElement} {LST_PREFIX}
          {token}
        </div>
      }
    />
  );
};

export default ExchangeRateDetailItem;
