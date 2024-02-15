export type TxnConfirmationModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  txnStatus: 'success' | 'error';
  txnHash: string;
  txnType: 'evm' | 'substrate';
};
