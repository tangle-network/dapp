import { Alert } from '@webb-tools/webb-ui-components';
import React, { type FC } from 'react';

import { ValidatorListTable } from '../../components';
import useAllValidators from '../../data/ValidatorTables/useAllValidators';
import { SelectValidatorsProps } from './types';

const SelectValidators: FC<SelectValidatorsProps> = ({
  setSelectedValidators,
}) => {
  const validators = useAllValidators();

  return (
    <div className="flex flex-col col-span-2 gap-2">
      <ValidatorListTable
        data={validators}
        setSelectedValidators={setSelectedValidators}
      />

      <Alert
        description="Submitting a new nomination will overwrite any existing nomination."
        type="info"
      />
    </div>
  );
};

export default React.memo(SelectValidators);
