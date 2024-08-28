import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import { LsProtocolId, LsToken } from '../../../constants/liquidStaking/types';
import { ExchangeRateType } from '../../../data/liquidStaking/useLsExchangeRate';
import useLsExchangeRate from '../../../data/liquidStaking/useLsExchangeRate';
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
  const { exchangeRate, isRefreshing } = useLsExchangeRate(type, protocolId);

  const exchangeRateElement =
    exchangeRate instanceof Error ? (
      exchangeRate
    ) : exchangeRate === null ? (
      <SkeletonLoader className="w-[50px]" />
    ) : isRefreshing ? (
      <div className="animate-pulse">{exchangeRate}</div>
    ) : (
      exchangeRate
    );

  const value =
    exchangeRateElement instanceof Error ? (
      exchangeRateElement
    ) : (
      <div className="flex gap-1 items-center justify-center whitespace-nowrap">
        1 {token} = {exchangeRateElement} {LS_DERIVATIVE_TOKEN_PREFIX}
        {token}
      </div>
    );

  return <DetailItem title="Rate" value={value} />;
};

export default ExchangeRateDetailItem;
