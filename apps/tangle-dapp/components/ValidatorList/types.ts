import { Validator } from '../../types';

export interface ValidatorListTableProps {
  validators: Validator[];
  selectedValidatorAddresses: string[];
  setSelectedValidatorAddresses: (selectedValidators: string[]) => void;
}

export type SortBy = 'asc' | 'dsc';

export type SortableKeys = keyof Pick<
  Validator,
  'commission' | 'nominatorCount' | 'totalStakeAmount'
>;
