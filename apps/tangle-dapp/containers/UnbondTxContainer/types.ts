export type UnbondTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type UnbondTokensProps = {
  nominatorAddress: string;
  amountToUnbond: number;
  setAmountToUnbond: (amount: number) => void;
  amountToUnbondError?: string;
  remainingStakedBalanceToUnbond: number;
};
