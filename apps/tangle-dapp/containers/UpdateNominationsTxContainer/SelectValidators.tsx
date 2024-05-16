import { Alert } from '@webb-tools/webb-ui-components';
import React, { Dispatch, type FC, SetStateAction } from 'react';

import ValidatorSelectionTable from '../../components/ValidatorSelectionTable/ValidatorSelectionTable';
import useAllValidators from '../../data/ValidatorTables/useAllValidators';

export type SelectValidatorsProps = {
  setSelectedValidators: Dispatch<SetStateAction<Set<string>>>;
};

const SelectValidators: FC<SelectValidatorsProps> = ({
  setSelectedValidators,
}) => {
  const validators = useAllValidators();

  return (
    <div className="flex flex-col col-span-2 gap-2">
      <ValidatorSelectionTable
        allValidators={validators}
        setSelectedValidators={setSelectedValidators}
        pageSize={20}
      />

      <Alert
        description="Submitting a new nomination will overwrite any existing nomination."
        type="info"
      />
    </div>
  );
};

export default React.memo(SelectValidators);
