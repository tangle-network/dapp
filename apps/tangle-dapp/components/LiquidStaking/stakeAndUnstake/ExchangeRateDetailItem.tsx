import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LST_PREFIX } from '../../../constants/liquidStaking/constants';
import { LsProtocolId, LsToken } from '../../../constants/liquidStaking/types';
import { ExchangeRateType } from '../../../data/liquidStaking/useExchangeRate';
import useExchangeRate from '../../../data/liquidStaking/useExchangeRate';
import DetailItem from './DetailItem';

export type ExchangeRateDetailItemProps = {
  type: ExchangeRateType;
  token: LsToken;
  protocolId: LsProtocolId;
};

const ExchangeRateDetailItem: FC<ExchangeRateDetailItemProps> = ({
  type,
  token,
  protocolId,
}) => {
  const { exchangeRate, isRefreshing } = useExchangeRate(type, protocolId);

  const exchangeRateElement =
    exchangeRate === null ? (
      <SkeletonLoader className="w-[50px]" />
    ) : isRefreshing ? (
      <div className="animate-pulse">{exchangeRate}</div>
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
