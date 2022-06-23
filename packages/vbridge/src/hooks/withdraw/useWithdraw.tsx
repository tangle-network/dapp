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

export type UseWithdrawProps = {
  note: Note | null;
  recipient: string;
};

export type WithdrawErrors = {
  error: string;

  validationError: {
    note: string;
    recipient: string;
  };
};
type RelayersState = {
  relayers: WebbRelayer[];
  loading: boolean;
  activeRelayer: OptionalActiveRelayer;
};
const relayersInitState: RelayersState = {
  relayers: [],
  activeRelayer: null,
  loading: true,
};
export const useWithdraw = (params: UseWithdrawProps) => {
  const [stage, setStage] = useState<TransactionState>(TransactionState.Ideal);
  const [receipt, setReceipt] = useState<string>('');
  const [outputNotes, setOutputNotes] = useState<Note[]>([]);
  const [relayersState, setRelayersState] = useState<RelayersState>(relayersInitState);
  const { activeApi, activeChain } = useWebContext();

  const [error, setError] = useState<WithdrawErrors>({
    error: '',
    validationError: {
      note: '',
      recipient: '',
    },
  });
  const withdrawApi = useMemo(() => {
    const withdraw = activeApi?.methods.variableAnchor.withdraw;
    if (!withdraw?.enabled) {
      return null;
    }
    return withdraw.inner;
  }, [activeApi]);

  useEffect(() => {
    const sub = activeApi?.relayerManager.listUpdated.subscribe(() => {
      if (params.note) {
        activeApi?.relayerManager.getRelayersByNote(params.note).then((r: WebbRelayer[]) => {
          setRelayersState((p) => ({
            ...p,
            loading: false,
            relayers: r,
          }));
        });
      }
    });
    return () => sub?.unsubscribe();
  }, [activeApi, params.note, withdrawApi]);
  const { registerInteractiveFeedback } = useWebContext();
  // hook events
  useEffect(() => {
    if (params.note) {
      activeApi?.relayerManager.getRelayersByNote(params.note).then((r: WebbRelayer[]) => {
        setRelayersState((p) => ({
          ...p,
          loading: false,
          relayers: r,
        }));
      });
    }

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
        setError((p) => ({
          ...p,
          validationError,
        }));
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
  }, [withdrawApi, params.note, activeApi?.relayerManager]);

  const withdraw = useCallback(async () => {
    if (!withdrawApi || !params.note) {
      return;
    }
    if (stage === TransactionState.Ideal) {
      if (params.note) {
        try {
          const withdrawPayload = await withdrawApi.withdraw(
            [params.note?.serialize()],
            params.recipient,
            params.note.note.amount
          );
          setReceipt(withdrawPayload.txHash);
          setOutputNotes(withdrawPayload.changeNotes);
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
    error: error.error,
    validationErrors: error.validationError,
    relayersState,
    setRelayer,
    relayerMethods: activeApi?.relayerManager,
  };
};
