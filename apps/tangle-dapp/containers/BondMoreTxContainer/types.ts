export type BondMoreTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type BondTokensProps = {
  amountToBond: number;
  setAmountToBond: (amount: number) => void;
  amountToBondError?: string;
  amountWalletBalance: number;
};
