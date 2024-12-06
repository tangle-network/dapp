import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { Dispatch, SetStateAction } from 'react';

import { Validator } from '../../types';

export type ValidatorSelectionTableProps = {
  allValidators: Validator[];
  isLoading: boolean;
  defaultSelectedValidators: SubstrateAddress[];
  setSelectedValidators: Dispatch<SetStateAction<Set<SubstrateAddress>>>;
  pageSize?: number;
};

export type SortBy = 'asc' | 'dsc';

export type SortableKeys = keyof Pick<
  Validator,
  'commission' | 'nominatorCount' | 'totalStakeAmount'
>;
