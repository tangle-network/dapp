import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import React, { Dispatch, type FC, SetStateAction } from 'react';

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
    <ValidatorSelectionTable
      defaultSelectedValidators={defaultSelectedValidators}
      allValidators={validators}
      setSelectedValidators={setSelectedValidators}
      isLoading={isLoading}
    />
  );
};

export default React.memo(SelectValidators);
