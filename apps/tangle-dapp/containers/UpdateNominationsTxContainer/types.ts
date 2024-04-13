export type UpdateNominationsTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  currentNominations: string[];
};

export type SelectValidatorsProps = {
  selectedValidators: string[];
  setSelectedValidators: (selectedValidators: string[]) => void;
};
