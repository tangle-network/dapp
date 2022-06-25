import {
  InteractiveFeedback,
  OptionalActiveRelayer,
  TransactionState,
  WebbErrorCodes,
  WebbRelayer,
} from '@webb-dapp/api-providers';
import { misbehavingRelayer } from '@webb-dapp/react-environment/error/interactive-errors/misbehaving-relayer';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { Note } from '@webb-tools/sdk-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { relayersInitState, RelayersState, WithdrawErrors } from './useWithdraw';

export type UseWithdrawsProps = {
  notes: Note[] | null;
  recipient: string;
  amount: number;
};

export type WithdrawsErrors = {
  error: string;

  validationError: {
    notes: string[];
    recipient: string;
  };
};

export const withdrawsErrorsInitialState: WithdrawsErrors = {
  error: '',
  validationError: {
    notes: [],
    recipient: '',
  },
};

export const useWithdraws = (params: UseWithdrawsProps) => {
  const [stage, setStage] = useState<TransactionState>(TransactionState.Ideal);
  const [receipt, setReceipt] = useState<string>('');
  const [outputNotes, setOutputNotes] = useState<Note[]>([]);
  const [relayersState, setRelayersState] = useState<RelayersState>(relayersInitState);
  const { activeApi, activeChain } = useWebContext();

  const [error, setError] = useState<WithdrawsErrors>(withdrawsErrorsInitialState);

  const withdrawApi = useMemo(() => {
    const withdraw = activeApi?.methods.variableAnchor.withdraw;
    if (!withdraw?.enabled) {
      return null;
    }
    return withdraw.inner;
  }, [activeApi]);

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

  const { registerInteractiveFeedback } = useWebContext();

  // hook events
  useEffect(() => {
    params.notes?.map((note) =>
      activeApi?.relayerManager.getRelayersByNote(note).then((r: WebbRelayer[]) => {
        setRelayersState((p) => ({
          ...p,
          loading: false,
          relayers: r,
        }));
      })
    );

    const sub = activeApi?.relayerManager.activeRelayerWatcher.subscribe((next: OptionalActiveRelayer) => {
      setRelayersState((p) => ({
        ...p,
        activeRelayer: next,
      }));
    });

    const unsubscribe: Record<string, (() => void) | void> = {};

    if (!withdrawApi) {
      return;
    }

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
  }, [withdrawApi, params.notes, activeApi?.relayerManager]);

  const withdraw = useCallback(async () => {
    if (!withdrawApi || !params.notes?.length) {
      return;
    }

    if (stage === TransactionState.Ideal) {
      if (params.notes.length) {
        try {
          const withdrawPayload = await withdrawApi.withdraw(
            params.notes?.map((note) => note.serialize()),
            params.recipient,
            params.amount.toString()
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

  const canCancel = useMemo(() => {
    const isBeforeSendingTX = stage < TransactionState.SendingTransaction;
    const actionStarted = stage > TransactionState.Ideal;
    const actionEnded = stage > TransactionState.SendingTransaction;
    const canCancel = isBeforeSendingTX && actionStarted;
    return canCancel || actionEnded;
  }, [stage]);

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
      activeApi?.relayerManager.setActiveRelayer(nextRelayer, activeChain?.id!);
    },
    [activeApi?.relayerManager, activeChain]
  );

  return {
    stage,
    receipt,
    setOutputNotes,
    outputNotes,
    withdraw,
    canCancel,
    cancelWithdraw,
    errors: error.error,
    validationError: error.validationError,
    relayersState,
    setRelayer,
    relayerMethods: activeApi?.relayerManager,
  };
};
