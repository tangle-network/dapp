import type { Dispatch, SetStateAction } from 'react';

export type UpdateNominationsTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  currentNominations: string[];
};

export type SelectValidatorsProps = {
  setSelectedValidators: Dispatch<SetStateAction<Set<string>>>;
};
