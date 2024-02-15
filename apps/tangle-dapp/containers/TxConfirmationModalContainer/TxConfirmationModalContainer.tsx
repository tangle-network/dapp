'use client';

import { TxConfirmationModal } from '../../components/TxConfirmationModal';
import { useTxConfirmationModal } from '../../context/TxConfirmationContext';

export const TxConfirmationModalContainer = () => {
  const { txConfirmationState, setTxConfirmationState } =
    useTxConfirmationModal();

  return (
    <TxConfirmationModal
      isModalOpen={txConfirmationState.isOpen}
      setIsModalOpen={(isOpen) =>
        setTxConfirmationState({ ...txConfirmationState, isOpen })
      }
      txStatus={txConfirmationState.status}
      txHash={txConfirmationState.hash}
      txType={txConfirmationState.txType}
    />
  );
};
