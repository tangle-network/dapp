export type WithdrawUnbondedTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type WithdrawUnbondedProps = {
  unbondedAmount: number;
  unbondingAmount: number;
};
