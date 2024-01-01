export type RebondTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type RebondTokensProps = {
  nominatorAddress: string;
  amountToRebond: number;
  setAmountToRebond: (amount: number) => void;
  amountToRebondError?: string;
  remainingUnbondedTokensToRebond: number;
};
