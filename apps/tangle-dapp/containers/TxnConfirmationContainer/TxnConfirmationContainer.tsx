'use client';

import { TxnConfirmationModal } from '../../components/TxnConfirmationCard';
import { useTxnConfirmation } from '../../context/TxnConfirmationContext';

export const TxnConfirmationContainer = () => {
  const { txnConfirmationState, setTxnConfirmationState } =
    useTxnConfirmation();

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
