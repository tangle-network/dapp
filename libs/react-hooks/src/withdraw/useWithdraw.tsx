import {
  OptionalActiveRelayer,
  Transaction,
  TransactionState,
  WebbRelayer,
} from '@webb-tools/abstract-api-provider';
import {
  misbehavingRelayer,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { InteractiveFeedback, WebbErrorCodes } from '@webb-tools/dapp-types';
import { NoteManager } from '@webb-tools/note-manager';
import { Note } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { useTxQueue } from '../transaction';

export type WithdrawErrors = {
  error: string;

  validationError: {
    notes: string[];
    recipient: string;
  };
};

export type RelayersState = {
  relayers: WebbRelayer[];
  loading: boolean;
  activeRelayer: OptionalActiveRelayer;
};

export type UseWithdrawProps = {
  notes: Note[] | null;
  recipient: string;
  amount: number;
  unwrapTokenAddress?: string;
};

/**
 * User withdraw
 * */
export const useWithdraw = (params: UseWithdrawProps) => {
  const [receipt, setReceipt] = useState<string>('');
  const { txQueue, txPayloads, currentTxId, api: txQueueApi } = useTxQueue();

  const stage = useMemo(() => {
    const withdrawTxQueue = txQueue.filter((tx) => tx.name === 'Withdraw');
    if (withdrawTxQueue.length === 0 || currentTxId === null) {
      return TransactionState.Ideal;
    }
    const lastTx = withdrawTxQueue[withdrawTxQueue.length - 1];
    return lastTx.currentStatus[0];
  }, [txQueue, txPayloads, currentTxId]);

  const [outputNotes, setOutputNotes] = useState<Note[]>([]);
  const [error, setError] = useState<WithdrawErrors>({
    error: '',
    validationError: {
      notes: [],
      recipient: '',
    },
  });

  const { activeApi } = useWebContext();
  const { registerInteractiveFeedback } = useWebContext();

  const withdrawApi = useMemo(() => {
    const withdraw = activeApi?.methods.variableAnchor.withdraw;
    if (!withdraw?.enabled) {
      return null;
    }
    return withdraw.inner;
  }, [activeApi]);

  const canCancel = useMemo(() => {
    const isBeforeSendingTX = stage < TransactionState.SendingTransaction;
    const actionStarted = stage > TransactionState.Ideal;
    const actionEnded = stage > TransactionState.SendingTransaction;
    const canCancel = isBeforeSendingTX && actionStarted;
    return canCancel || actionEnded;
  }, [stage]);

  const withdraw = useCallback(async () => {
    if (!withdrawApi || !params.notes?.length) {
      return;
    }

    if (stage === TransactionState.Ideal) {
      if (params.notes.length) {
        try {
          const withdrawNotes = NoteManager.getNotesFifo(
            params.notes,
            ethers.utils.parseUnits(
              params.amount.toString(),
              params.notes[0].note.denomination
            )
          );

          // If the available notes are not sufficient for requested withdraw, return.
          // This case shouldn't be hit because the frontend should not make a withdraw
          // call if the form inputs are not sufficient.
          if (!withdrawNotes || withdrawNotes.length === 0) {
            console.log('no withdrawNotes detected');
            return;
          }
          const withdrawNoteStrings = withdrawNotes.map((note) =>
            note.serialize()
          );

          const destChainId = Number(withdrawNotes[0].note.targetChainId);
          const destVAnchorContract =
            withdrawApi.getDestVAnchorContract(destChainId);

          if (!destVAnchorContract) {
            console.log('no destVAnchorContract detected');
            return;
          }

          // If the token / wrapUnwrapToken
          // - is undefined -> no wrapping
          // - is 0x0000000000000000000000000000000000000000 -> native token
          // - is equal to the FungibleTokenWrapper token -> no wrapping
          // - is equal to some random address / random ERC20 token -> wrap that token
          const unwrapTokenAddress =
            params.unwrapTokenAddress ||
            (await destVAnchorContract.inner.token());

          const payload = withdrawApi.withdraw(
            withdrawNoteStrings,
            params.recipient,
            ethers.utils
              .parseUnits(
                params.amount.toString(),
                params.notes[0].note.denomination
              )
              .toString(),
            withdrawNotes[0],
            unwrapTokenAddress
          );

          if (payload instanceof Transaction) {
            txQueueApi.registerTransaction(payload);
          }

          const withdrawPayload = await payload;
          setReceipt(withdrawPayload.txHash);
          setOutputNotes(withdrawPayload.outputNotes);
          return true;
        } catch (e) {
          console.log('error from withdraw api', e);

          if ((e as any)?.code === WebbErrorCodes.RelayerMisbehaving) {
            const interactiveFeedback: InteractiveFeedback =
              misbehavingRelayer();
            registerInteractiveFeedback(interactiveFeedback);
          }

          return false;
        }
      }
    }
  }, [withdrawApi, txQueueApi, stage, params, registerInteractiveFeedback]);

  const cancelWithdraw = useCallback(
    async (id: string) => {
      return txQueueApi.cancelTransaction(id);
    },
    [txQueueApi]
  );

  const setStage = useCallback(() => {}, []);

  return {
    stage,
    setStage,
    receipt,
    setOutputNotes,
    outputNotes,
    withdraw,
    canCancel,
    cancelWithdraw,
    error: error.error,
    validationError: error.validationError,
  };
};
