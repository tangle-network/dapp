import { Alert, Typography } from '@webb-tools/webb-ui-components';
import { type FC, useEffect } from 'react';

import { ValidatorListTable } from '../../components';
import useAllValidators from '../../data/ValidatorTables/useAllValidators';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { SelectValidatorsProps } from './types';

const SelectValidators: FC<SelectValidatorsProps> = ({
  selectedValidators,
  setSelectedValidators,
}) => {
  const validators = useAllValidators();

  const { valueAfterMount: cachedValidators, set: setCachedValidators } =
    useLocalStorage(LocalStorageKey.VALIDATORS, true);

  useEffect(() => {
    if (validators.length > 0) {
      setCachedValidators(validators);
    }
  }, [validators, setCachedValidators]);

  return (
    <div className="flex flex-col gap-2 col-span-2">
      <ValidatorListTable
        data={
          cachedValidators && cachedValidators.length > 0
            ? cachedValidators
            : validators
        }
        selectedValidators={selectedValidators}
        setSelectedValidators={setSelectedValidators}
      />

      <Typography
        variant="body1"
        fw="normal"
        className="text-mono-200 dark:text-mono-0"
      >
        Selected: {selectedValidators.length}/
        {cachedValidators?.length ?? validators.length}
      </Typography>

      <Alert
        description="Submitting a new nomination will overwrite any existing nomination."
        type="info"
      />
    </div>
  );
};

export default SelectValidators;
