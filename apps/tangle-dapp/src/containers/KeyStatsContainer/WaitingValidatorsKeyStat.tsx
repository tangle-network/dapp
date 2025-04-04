import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC } from 'react';

import { KeyStatsItem } from '@tangle-network/ui-components';
import useWaitingCountSubscription from '../../data/KeyStats/useWaitingCountSubscription';

const WaitingValidatorsKeyStat: FC = () => {
  const { data, error, isLoading } = useWaitingCountSubscription();

  return (
    <KeyStatsItem
      title="Waiting"
      tooltip="Nodes waiting in line to become active validators."
      className="!border-r-0 lg:!border-r"
      showDataBeforeLoading
      error={error}
      isLoading={isLoading}
    >
      {data?.value1 ?? EMPTY_VALUE_PLACEHOLDER}
    </KeyStatsItem>
  );
};

export default WaitingValidatorsKeyStat;
