'use client';

import { TxConfirmationModal } from '../../components/TxConfirmationModal';
import { useTxConfirmationModal } from '../../context/TxConfirmationContext';

export const TxConfirmationModalContainer = () => {
  const { txnConfirmationState, setTxnConfirmationState } =
    useTxConfirmationModal();

  return (
    <TxConfirmationModal
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
