export type TxConfirmationModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  txStatus: 'success' | 'error';
  txHash: string;
  txType: 'evm' | 'substrate';
};
