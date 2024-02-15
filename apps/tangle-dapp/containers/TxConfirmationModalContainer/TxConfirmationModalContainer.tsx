'use client';

import { TxConfirmationModal } from '../../components/TxConfirmationModal';
import { useTxConfirmationModal } from '../../context/TxConfirmationContext';

export const TxConfirmationModalContainer = () => {
  const { txnConfirmationState, setTxConfirmationState } =
    useTxConfirmationModal();

  return (
    <TxConfirmationModal
      isModalOpen={txnConfirmationState.isOpen}
      setIsModalOpen={(isOpen) =>
        setTxConfirmationState({ ...txnConfirmationState, isOpen })
      }
      txnStatus={txnConfirmationState.status}
      txnHash={txnConfirmationState.hash}
      txnType={txnConfirmationState.txnType}
    />
  );
};
