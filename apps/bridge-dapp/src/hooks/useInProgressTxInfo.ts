import { useEffect, useMemo, useState } from 'react';
import { useLatestTransactionStage } from './useLatestTransactionStage';
import useCurrentTx from './useCurrentTx';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { getCardTitle } from '../utils/getCardTitle';

/**
 * Hook to get the information of the current tx in progress
 * for the confirmation card UI.
 * @param isWrapOrUnwrapFlow optional flag to indicate if the current tx has wrap or unwrap flow
 * @param onTransactionDismiss optional callback to be called when the current tx is dismissed
 * @returns an object containing:
 * - cardTitle: the title of the confirmation card of the current tx
 * - currentStep: the current step of the current tx
 * - inProgressTxId: the current tx id in progress
 * - setInProgressTxId: a function to set the current tx id
 * - setTotalStep: a function to set the total step of the current tx
 * - totalStep: the total step of the current tx
 * - txStatus: the transaction status of the current tx
 * - txStatusMessage: the transaction status message of the current tx
 */
const useInProgressTxInfo = (
  isWrapOrUnwrapFlow?: boolean,
  onTransactionDismiss?: () => void,
) => {
  const { txQueue } = useWebContext();

  const [inProgressTxId, setInProgressTxId] = useState('');

  const [totalStep, setTotalStep] = useState<number | undefined>();

  const stage = useLatestTransactionStage(inProgressTxId);

  const inProgressTx = useCurrentTx(txQueue.txQueue, inProgressTxId);

  const cardTitle = useMemo(() => {
    if (!inProgressTx) {
      return undefined;
    }

    return getCardTitle(stage, inProgressTx.name, isWrapOrUnwrapFlow).trim();
  }, [inProgressTx, stage, isWrapOrUnwrapFlow]);

  const [txStatusMessage, currentStep, txStatus] = useMemo(() => {
    if (!inProgressTxId) {
      return ['', undefined, undefined];
    }

    const { txPayloads } = txQueue;

    const txPayload = txPayloads.find(
      (txPayload) => txPayload.id === inProgressTxId,
    );
    const message = txPayload
      ? txPayload.txStatus.message?.replace('...', '')
      : '';

    const step = txPayload?.currentStep;
    const status = txPayload?.txStatus.status;

    return [message, step, status];
  }, [inProgressTxId, txQueue]);

  // Side effect to watch the current tx in the txQueue and
  // the current tx id which is being set by the parent component
  // if the tx id has a value but there is no tx in the txQueue
  // that means the tx has been dismissed so we call the callback
  // to notify the parent component
  useEffect(() => {
    if (inProgressTxId && !inProgressTx) {
      onTransactionDismiss?.();
    }
  }, [inProgressTxId, inProgressTx, onTransactionDismiss]);

  return {
    cardTitle,
    currentStep,
    inProgressTxId,
    setInProgressTxId,
    setTotalStep,
    totalStep,
    txStatus,
    txStatusMessage,
  };
};

export default useInProgressTxInfo;
