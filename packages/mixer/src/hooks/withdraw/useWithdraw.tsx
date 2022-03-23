import { misbehavingRelayer } from '@webb-dapp/react-environment/error/interactive-errors/misbehaving-relayer';
import { useWebContext, WithdrawState } from '@webb-dapp/react-environment/webb-context';
import { ActiveWebbRelayer, WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import { InteractiveFeedback, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { LoggerService } from '@drewstone/app-util';
import { Note } from '@drewstone/sdk-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

const logger = LoggerService.get('useWithdrawHook');

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
  activeRelayer: null | ActiveWebbRelayer;
};
const relayersInitState: RelayersState = {
  relayers: [],
  activeRelayer: null,
  loading: true,
};
export const useWithdraw = (params: UseWithdrawProps) => {
  const [stage, setStage] = useState<WithdrawState>(WithdrawState.Ideal);
  const { activeApi } = useWebContext();
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
    if (!withdraw?.enabled) return null;
    return withdraw.inner;
  }, [activeApi]);

  useEffect(() => {
    const sub = activeApi?.relayingManager.listUpdated.subscribe(() => {
      if (params.note) {
        withdrawApi?.getRelayersByNote(params.note).then((r) => {
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

  // hook events
  useEffect(() => {
    if (params.note) {
      withdrawApi?.getRelayersByNote(params.note).then((r) => {
        setRelayersState((p) => ({
          ...p,
          loading: false,
          relayers: r,
        }));
      });
    }

    const sub = withdrawApi?.watcher.subscribe((next) => {
      setRelayersState((p) => ({
        ...p,
        activeRelayer: next,
      }));
    });
    const unsubscribe: Record<string, (() => void) | void> = {};
    if (!withdrawApi) return;
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
  }, [withdrawApi, params.note]);

  const withdraw = useCallback(async () => {
    if (!withdrawApi || !params.note) return;
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
      withdrawApi?.setActiveRelayer(nextRelayer);
    },
    [withdrawApi]
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
    relayerMethods: activeApi?.relayingManager,
  };
};
