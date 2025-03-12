import { SkeletonLoader } from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC } from 'react';

import useLsActivePoolDisplayName from '../../../data/liquidStaking/useLsActivePoolDisplayName';
import useLsExchangeRate from '../../../data/liquidStaking/useLsExchangeRate';
import DetailItem from './DetailItem';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const ExchangeRateDetailItem: FC = () => {
  const { displayName: lsActivePoolDisplayName } = useLsActivePoolDisplayName();
  const exchangeRate = useLsExchangeRate();

  const networkTokenSymbol = useNetworkStore(
    (store) => store.network2?.tokenSymbol,
  );

  const exchangeRateElement =
    exchangeRate === null ? (
      <SkeletonLoader className="w-[50px]" />
    ) : (
      exchangeRate
    );

  const value =
    exchangeRateElement instanceof Error ? (
      exchangeRateElement
    ) : (
      <div className="flex gap-1 items-center justify-center whitespace-nowrap">
        1 {networkTokenSymbol ?? EMPTY_VALUE_PLACEHOLDER} ={' '}
        {exchangeRateElement}{' '}
        {lsActivePoolDisplayName?.toUpperCase() ?? EMPTY_VALUE_PLACEHOLDER}
      </div>
    );

  return <DetailItem title="Rate" value={value} />;
};

export default ExchangeRateDetailItem;
