import { Validator } from '../../types';

export interface ValidatorListTableProps {
  data: Validator[];
  selectedValidators: string[];
  setSelectedValidators: (selectedValidators: string[]) => void;
}

export type SortBy = 'asc' | 'dsc';

export type SortableKeys =
  | 'effectiveAmountStaked'
  | 'delegations'
  | 'commission';
