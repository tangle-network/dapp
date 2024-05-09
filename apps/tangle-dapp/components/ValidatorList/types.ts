import type { Dispatch, SetStateAction } from 'react';

import type { Validator } from '../../types';

export interface ValidatorListTableProps {
  data: Validator[];
  setSelectedValidators: Dispatch<SetStateAction<Set<string>>>;
}
