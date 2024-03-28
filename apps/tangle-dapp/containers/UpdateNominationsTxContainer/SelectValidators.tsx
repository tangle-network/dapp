import { Typography } from '@webb-tools/webb-ui-components';
import { type FC, useMemo } from 'react';

import { ValidatorList } from '../../components';
import { SortBy } from '../../components/ValidatorList/types';
import { SelectValidatorsProps } from './types';

const SelectValidators: FC<SelectValidatorsProps> = ({
  validators,
  selectedValidators,
  setSelectedValidators,
}) => {
  const sortBy: SortBy[] = useMemo(
    () => [
      { key: 'effectiveAmountStakedRaw', title: 'Total Staked' },
      { key: 'delegations', title: 'Total Nominations' },
      { key: 'commission', title: 'Commission' },
      { key: 'status', title: 'Status' },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4 col-span-2">
      <ValidatorList
        validators={validators}
        selectedValidators={selectedValidators}
        setSelectedValidators={setSelectedValidators}
        sortBy={sortBy}
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
