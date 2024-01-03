import { Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { ValidatorList } from '../../components';
import { SelectDelegatesProps } from './types';

const SelectDelegates: FC<SelectDelegatesProps> = ({
  validators,
  selectedValidators,
  setSelectedValidators,
}) => {
  return (
    <div className="flex flex-col gap-4 col-span-2">
      <ValidatorList
        validators={validators}
        selectedValidators={selectedValidators}
        setSelectedValidators={setSelectedValidators}
        sortBy={[
          { key: 'effectiveAmountStakedRaw', title: 'Total Stake' },
          { key: 'delegations', title: '# of Nominations' },
          { key: 'commission', title: 'Commission' },
          { key: 'status', title: 'Status' },
        ]}
      />

      <Typography
        variant="body1"
        fw="normal"
        className="text-mono-200 dark:text-mono-0"
      >
        Selected: {selectedValidators.length}/{validators.length}
      </Typography>
    </div>
  );
};

export default SelectDelegates;
