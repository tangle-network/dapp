import { FC } from 'react';

import DetailItem from './DetailItem';

const UnstakePeriodDetailItem: FC = () => {
  // TODO: Load this info from the chain. Currently using dummy data.
  return (
    <DetailItem
      title="Unstake period"
      tooltip="The period of time you need to wait before you can unstake your tokens."
      value={
        <div>
          <strong>7</strong> days
        </div>
      }
    />
  );
};

export default UnstakePeriodDetailItem;
