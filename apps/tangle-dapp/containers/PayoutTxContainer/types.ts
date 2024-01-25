export type PayoutTxProps = {
  validatorAddress: string;
  era: number;
};

export type PayoutTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  payoutTxProps: PayoutTxProps;
};
