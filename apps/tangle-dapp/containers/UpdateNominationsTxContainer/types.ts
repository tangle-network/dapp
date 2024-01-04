import { Validator } from '../../types';

export type UpdateNominationsTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  currentNominations: string[];
};

export type SelectValidatorsProps = {
  validators: Validator[];
  selectedValidators: string[];
  setSelectedValidators: (selectedValidators: string[]) => void;
};
