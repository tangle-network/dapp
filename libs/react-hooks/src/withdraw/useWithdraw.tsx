import { OptionalActiveRelayer, TransactionState, WebbRelayer } from '@nepoche/abstract-api-provider';
import { InteractiveFeedback, WebbErrorCodes } from '@nepoche/dapp-types';
import { NoteManager } from '@nepoche/note-manager';
import { misbehavingRelayer, useWebContext } from '@nepoche/api-provider-environment';
import { calculateTypedChainId, Note } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
};

export const useWithdraw = (params: UseWithdrawProps) => {
  const [stage, setStage] = useState<TransactionState>(TransactionState.Ideal);
  const [receipt, setReceipt] = useState<string>('');

  const [outputNotes, setOutputNotes] = useState<Note[]>([]);
  const [relayersState, setRelayersState] = useState<RelayersState>({
    relayers: [],
    activeRelayer: null,
    loading: true,
  });
  const [error, setError] = useState<WithdrawErrors>({
    error: '',
    validationError: {
      notes: [],
      recipient: '',
    },
  });

  const { activeApi, activeChain } = useWebContext();
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
    console.log(params);

    if (!withdrawApi || !params.notes?.length) {
      return;
    }

    if (stage === TransactionState.Ideal) {
      if (params.notes.length) {
        try {
          const withdrawNotes = NoteManager.getNotesFifo(
            params.notes,
            ethers.utils.parseUnits(params.amount.toString(), params.notes[0].note.denomination)
          );

          // If the available notes are not sufficient for requested withdraw, return.
          // This case shouldn't be hit because the frontend should not make a withdraw
          // call if the form inputs are not sufficient.
          if (!withdrawNotes) {
            console.log('no withdrawNotes detected');
            return;
          }
          const withdrawNoteStrings = withdrawNotes.map((note) => note.serialize());

          const withdrawPayload = await withdrawApi.withdraw(
            withdrawNoteStrings,
            params.recipient,
            ethers.utils.parseUnits(params.amount.toString(), params.notes[0].note.denomination).toString()
          );
          setReceipt(withdrawPayload.txHash);
          setOutputNotes(withdrawPayload.outputNotes);
        } catch (e) {
          console.log('error from withdraw api', e);

          if ((e as any)?.code === WebbErrorCodes.RelayerMisbehaving) {
            let interactiveFeedback: InteractiveFeedback = misbehavingRelayer();
            registerInteractiveFeedback(interactiveFeedback);
          }
        }
      }
    }
  }, [withdrawApi, stage, params, registerInteractiveFeedback]);

  const cancelWithdraw = useCallback(async () => {
    if (canCancel) {
      if (stage !== TransactionState.Ideal) {
        await withdrawApi?.cancelWithdraw();
        setStage(TransactionState.Ideal);
      } else {
        setStage(TransactionState.Ideal);
      }
    }
  }, [canCancel, withdrawApi, stage, setStage]);

  const setRelayer = useCallback(
    (nextRelayer: WebbRelayer | null) => {
      if (activeChain) {
        activeApi?.relayerManager.setActiveRelayer(
          nextRelayer,
          calculateTypedChainId(activeChain.chainType, activeChain.chainId)
        );
      }
    },
    [activeApi?.relayerManager, activeChain]
  );

  useEffect(() => {
    const subscriptions = params.notes?.map((note) =>
      activeApi?.relayerManager.listUpdated.subscribe(() => {
        if (!note) {
          return;
        }

        activeApi?.relayerManager.getRelayersByNote(note).then((r: WebbRelayer[]) => {
          setRelayersState((p) => ({
            ...p,
            loading: false,
            relayers: r,
          }));
        });
      })
    );

    return () => subscriptions?.forEach((sub) => sub?.unsubscribe());
  }, [activeApi, params.notes, withdrawApi]);

  // hook events
  useEffect(() => {
    if (!activeApi) {
      return;
    }

    // We can determine the compatible relayers by the selected target.
    if (params.notes?.length) {
      activeApi.relayerManager.getRelayersByNote(params.notes[0]).then((r: WebbRelayer[]) => {
        setRelayersState((p) => ({
          ...p,
          loading: false,
          relayers: r,
        }));
      });
    }

    // Subscribe to updates for the active relayer
    const sub = activeApi?.relayerManager.activeRelayerWatcher.subscribe((next: OptionalActiveRelayer) => {
      setRelayersState((p) => ({
        ...p,
        activeRelayer: next,
      }));
    });

    if (!withdrawApi) {
      return;
    }

    const unsubscribe: Record<string, (() => void) | void> = {};
    unsubscribe['stateChange'] = withdrawApi.on('stateChange', (stage: TransactionState) => {
      setStage(stage);
    });

    unsubscribe['validationError'] = withdrawApi.on(
      'validationError',
      (validationError: { note: string; recipient: string }) => {
        setError((p) => {
          const noteErrors = p.validationError.notes.slice();
          noteErrors.push(validationError.note);

          return {
            ...p,
            validationError: {
              notes: noteErrors,
              recipient: validationError.recipient,
            },
          };
        });
      }
    );

    unsubscribe['error'] = withdrawApi.on('error', (withdrawError: any) => {
      setError((p) => ({
        ...p,
        error: withdrawError,
      }));
    });

    return () => {
      sub?.unsubscribe();
      Object.values(unsubscribe).forEach((v) => v && v());
    };
  }, [withdrawApi, params.notes, activeApi, activeApi?.relayerManager]);

  return {
    stage,
    receipt,
    setOutputNotes,
    outputNotes,
    withdraw,
    canCancel,
    cancelWithdraw,
    error: error.error,
    validationError: error.validationError,
    relayersState,
    setRelayer,
    relayerMethods: activeApi?.relayerManager,
  };
};
