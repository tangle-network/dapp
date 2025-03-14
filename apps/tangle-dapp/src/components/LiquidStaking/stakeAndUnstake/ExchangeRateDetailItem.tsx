import { SkeletonLoader } from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC } from 'react';

import { LsToken } from '../../../constants/liquidStaking/types';
import useLsActivePoolDisplayName from '../../../data/liquidStaking/useLsActivePoolDisplayName';
import useLsExchangeRate from '../../../data/liquidStaking/useLsExchangeRate';
import DetailItem from './DetailItem';

export type ExchangeRateDetailItemProps = {
  token: LsToken;
};

const ExchangeRateDetailItem: FC<ExchangeRateDetailItemProps> = ({ token }) => {
  const { displayName: lsActivePoolDisplayName } = useLsActivePoolDisplayName();
  const exchangeRate = useLsExchangeRate();

  const exchangeRateElement =
    exchangeRate instanceof Error ? (
      exchangeRate
    ) : exchangeRate === null ? (
      <SkeletonLoader className="w-[50px]" />
    ) : (
      exchangeRate
    );

  const value =
    exchangeRateElement instanceof Error ? (
      exchangeRateElement
    ) : (
      <div className="flex gap-1 items-center justify-center whitespace-nowrap">
        1 {token} = {exchangeRateElement}{' '}
        {lsActivePoolDisplayName?.toUpperCase() ?? EMPTY_VALUE_PLACEHOLDER}
      </div>
    );

  return <DetailItem title="Rate" value={value} />;
};

export default ExchangeRateDetailItem;
