export type UpdatePayeeTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

export type UpdatePayeeProps = {
  currentPayee: string | number;
  paymentDestinationOptions: string[];
  paymentDestination: string;
  setPaymentDestination: (paymentDestination: string) => void;
};
