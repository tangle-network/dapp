export type RebondTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type RebondTokensProps = {
  amountToRebond: number;
  setAmountToRebond: (amount: number) => void;
  amountToRebondError?: string;
  remainingUnbondedTokensToRebond: number;
  unbondedAmount: number;
  unbondingAmount: number;
};
