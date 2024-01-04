import { Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { ValidatorList } from '../../components';
import { SelectValidatorsProps } from './types';

const SelectValidators: FC<SelectValidatorsProps> = ({
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
          { key: 'effectiveAmountStakedRaw', title: 'Total Staked' },
          { key: 'delegations', title: 'Total Nominations' },
          { key: 'commission', title: 'Commission' },
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

export default SelectValidators;
