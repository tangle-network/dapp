import { Alert } from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { Dispatch, type FC, SetStateAction, memo } from 'react';

import ValidatorSelectionTable from '../../components/ValidatorSelectionTable/ValidatorSelectionTable';
import useAllValidators from '../../data/ValidatorTables/useAllValidators';

export type SelectValidatorsProps = {
  defaultSelectedValidators?: SubstrateAddress[];
  setSelectedValidators: Dispatch<SetStateAction<Set<SubstrateAddress>>>;
};

const SelectValidators: FC<SelectValidatorsProps> = ({
  defaultSelectedValidators = [],
  setSelectedValidators,
}) => {
  const { validators, isLoading } = useAllValidators();

  return (
    <div className="flex flex-col col-span-2 gap-2">
      <ValidatorSelectionTable
        defaultSelectedValidators={defaultSelectedValidators}
        allValidators={validators}
        setSelectedValidators={setSelectedValidators}
        isLoading={isLoading}
      />

      <Alert
        description="Submitting a new nomination will overwrite any existing nomination."
        type="info"
      />
    </div>
  );
};

export default memo(SelectValidators);
