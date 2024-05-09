import { Dispatch, SetStateAction } from 'react';

import { Validator } from '../../types';

export type ValidatorSelectionTableProps = {
  data: Validator[];
  setSelectedValidators: Dispatch<SetStateAction<Set<string>>>;
};

export type SortBy = 'asc' | 'dsc';

export type SortableKeys = keyof Pick<
  Validator,
  'commission' | 'nominatorCount' | 'totalStakeAmount'
>;
