'use client';

import { TxnConfirmationModal } from '../../components/TxnConfirmationModal';
import { useTxnConfirmationModal } from '../../context/TxnConfirmationContext';

export const TxnConfirmationModalContainer = () => {
  const { txnConfirmationState, setTxnConfirmationState } =
    useTxnConfirmationModal();

  return (
    <TxnConfirmationModal
      isModalOpen={txnConfirmationState.isOpen}
      setIsModalOpen={(isOpen) =>
        setTxnConfirmationState({ ...txnConfirmationState, isOpen })
      }
      txnStatus={txnConfirmationState.status}
      txnHash={txnConfirmationState.hash}
      txnType={txnConfirmationState.txnType}
    />
  );
};
