import { Button, TransactionQueueCard } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { EducationCard } from '../../components/EducationCard';
import { EduCardWithTxQueueProps, TxQueueContainerProps } from './types';

const EduCardWithTxQueue: FC<EduCardWithTxQueueProps> = ({ activeTab }) => {
  const { txQueue } = useWebContext();
  const { txPayloads } = txQueue;

  const isDisplayTxQueueCard = useMemo(
    () => txPayloads.length > 0,
    [txPayloads]
  );

  const [loading, setLoading] = useState(false);

  const handleLoading = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 10000);
  }, []);

  return (
    <div>
      <div>
        <Button
          loadingText="Loading..."
          isLoading={loading}
          onClick={handleLoading}
        >
          Click me
        </Button>
      </div>
      {/** Transaction Queue Card */}
      <TxQueueContainer
        isDisplay={isDisplayTxQueueCard}
        transactionPayloads={txPayloads}
      />

      {/** Education cards */}
      <EducationCard
        defaultOpen={!isDisplayTxQueueCard} // If there is a tx queue card, then don't open the education card by default
        currentTab={activeTab}
      />
    </div>
  );
};

export default EduCardWithTxQueue;

const TxQueueContainer: FC<TxQueueContainerProps> = ({
  isDisplay,
  transactionPayloads,
}) => {
  if (!isDisplay) {
    return null;
  }

  return (
    <TransactionQueueCard
      className="w-full mb-4 max-w-none"
      transactions={transactionPayloads}
    />
  );
};
