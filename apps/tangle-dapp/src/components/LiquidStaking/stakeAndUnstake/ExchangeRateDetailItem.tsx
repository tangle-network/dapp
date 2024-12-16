import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { LsToken } from '../../../constants/liquidStaking/types';
import useLsActivePoolDisplayName from '../../../data/liquidStaking/useLsActivePoolDisplayName';
import useLsExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useLsExchangeRate';
import DetailItem from './DetailItem';

export type ExchangeRateDetailItemProps = {
  type: ExchangeRateType;
  token: LsToken;
};

const ExchangeRateDetailItem: FC<ExchangeRateDetailItemProps> = ({
  type,
  token,
}) => {
  const { displayName: lsActivePoolDisplayName } = useLsActivePoolDisplayName();
  const { exchangeRate, isRefreshing } = useLsExchangeRate(type);

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
      <div
        className={twMerge(
          'flex gap-1 items-center justify-center whitespace-nowrap',
          isRefreshing && 'animate-pulse',
        )}
      >
        1 {token} = {exchangeRateElement}{' '}
        {lsActivePoolDisplayName?.toUpperCase() ?? EMPTY_VALUE_PLACEHOLDER}
      </div>
    );

  return <DetailItem title="Rate" value={value} />;
};

export default ExchangeRateDetailItem;
