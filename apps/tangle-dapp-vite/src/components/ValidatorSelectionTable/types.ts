import { Dispatch, SetStateAction } from 'react';

import { Validator } from '../../types';

export type ValidatorSelectionTableProps = {
  allValidators: Validator[];
  isLoading: boolean;
  defaultSelectedValidators: string[];
  setSelectedValidators: Dispatch<SetStateAction<Set<string>>>;
  pageSize?: number;
};

export type SortBy = 'asc' | 'dsc';

export type SortableKeys = keyof Pick<
  Validator,
  'commission' | 'nominatorCount' | 'totalStakeAmount'
>;
