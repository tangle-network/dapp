import { ValidatorType } from '../../types';

export type ValidatorListProps = {
  validators: ValidatorType[];
  selectedValidators: string[];
  setSelectedValidators: (selectedValidators: string[]) => void;
};
