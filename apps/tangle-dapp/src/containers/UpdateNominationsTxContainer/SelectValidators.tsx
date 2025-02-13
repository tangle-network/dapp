import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { Dispatch, type FC, SetStateAction, memo } from 'react';

import ValidatorSelectionTable from '../../components/ValidatorSelectionTable';
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

export default memo(SelectValidators);
