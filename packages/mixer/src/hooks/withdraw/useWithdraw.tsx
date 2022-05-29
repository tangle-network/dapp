import {
  ActiveWebbRelayer,
  InteractiveFeedback,
  WebbErrorCodes,
  WebbRelayer,
  WithdrawState,
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
export type RelayersState = {
  relayers: WebbRelayer[];
  loading: boolean;
  activeRelayer: null | ActiveWebbRelayer;
};
const relayersInitState: RelayersState = {
  relayers: [],
  activeRelayer: null,
  loading: true,
};
export const useWithdraw = (params: UseWithdrawProps) => {
  const [stage, setStage] = useState<WithdrawState>(WithdrawState.Ideal);
  const { activeApi, activeChain } = useWebContext();
  const [relayersState, setRelayersState] = useState<RelayersState>(relayersInitState);
  const [receipt, setReceipt] = useState('');
  const [error, setError] = useState<WithdrawErrors>({
    error: '',
    validationError: {
      note: '',
      recipient: '',
    },
  });
  const { registerInteractiveFeedback } = useWebContext();
  const withdrawApi = useMemo(() => {
    const withdraw = activeApi?.methods.mixer.withdraw;
    if (!withdraw?.enabled) {
      return null;
    }
    return withdraw.inner;
  }, [activeApi]);

  useEffect(() => {
    const sub = activeApi?.relayerManager.listUpdated.subscribe(() => {
      if (params.note) {
        activeApi?.relayerManager.getRelayersByNote(params.note).then((r) => {
          setRelayersState((p) => ({
            ...p,
            loading: false,
            relayers: r,
          }));
        });
      }
    });
    return () => sub?.unsubscribe();
  }, [activeApi, params.note]);

  // hook events
  useEffect(() => {
    if (params.note) {
      activeApi?.relayerManager.getRelayersByNote(params.note).then((r) => {
        setRelayersState((p) => ({
          ...p,
          loading: false,
          relayers: r,
        }));
      });
    }

    const sub = activeApi?.relayerManager.activeRelayerWatcher.subscribe((next) => {
      setRelayersState((p) => ({
        ...p,
        activeRelayer: next,
      }));
    });
    const unsubscribe: Record<string, (() => void) | void> = {};
    if (!withdrawApi) {
      return;
    }
    unsubscribe['stateChange'] = withdrawApi.on('stateChange', (stage: WithdrawState) => {
      setStage(stage);
    });

    unsubscribe['validationError'] = withdrawApi.on('validationError', (validationError) => {
      setError((p) => ({
        ...p,
        validationError,
      }));
    });
    unsubscribe['error'] = withdrawApi.on('error', (withdrawError) => {
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
    if (stage === WithdrawState.Ideal) {
      const { note, recipient } = params;
      try {
        const txReceipt = await withdrawApi.withdraw(note.serialize(), recipient);
        setReceipt(txReceipt);
      } catch (e) {
        console.log('error from withdraw api', e);

        if ((e as any)?.code === WebbErrorCodes.RelayerMisbehaving) {
          let interactiveFeedback: InteractiveFeedback = misbehavingRelayer();
          registerInteractiveFeedback(interactiveFeedback);
        }
      }
    }
  }, [withdrawApi, stage, params, registerInteractiveFeedback]);

  const canCancel = useMemo(() => {
    const isBeforeSendingTX = stage < WithdrawState.SendingTransaction;
    const actionStarted = stage > WithdrawState.Ideal;
    const actionEnded = stage > WithdrawState.SendingTransaction;
    const canCancel = isBeforeSendingTX && actionStarted;
    return canCancel || actionEnded;
  }, [stage]);

  const cancelWithdraw = useCallback(async () => {
    if (canCancel) {
      if (stage !== WithdrawState.Ideal) {
        await withdrawApi?.cancelWithdraw();
        setStage(WithdrawState.Ideal);
      } else {
        setStage(WithdrawState.Ideal);
      }
    }
  }, [canCancel, withdrawApi, stage, setStage]);

  const setRelayer = useCallback(
    (nextRelayer: WebbRelayer | null) => {
      activeApi?.relayerManager.setActiveRelayer(nextRelayer, activeChain?.id!);
    },
    [activeApi, activeChain]
  );
  return {
    receipt,
    setReceipt,
    stage,
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
