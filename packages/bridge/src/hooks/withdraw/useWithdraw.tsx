import { useWebContext, WithdrawState } from '@webb-dapp/react-environment/webb-context';
import { ActiveWebbRelayer, WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Note } from '@webb-tools/sdk-mixer';
import { LoggerService } from '@webb-tools/app-util';
import { InteractiveFeedback, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { misbehavingRelayer } from '@webb-dapp/react-environment/error/interactive-errors/misbehaving-relayer';

const logger = LoggerService.get('useWithdrawHook');

export type UseWithdrawProps = {
  note: string;
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
  const [receipt, setReceipt] = useState('');
  const [relayersState, setRelayersState] = useState<RelayersState>(relayersInitState);
  const { activeApi } = useWebContext();

  const [error, setError] = useState<WithdrawErrors>({
    error: '',
    validationError: {
      note: '',
      recipient: '',
    },
  });
  const withdrawApi = useMemo(() => {
    const withdraw = activeApi?.methods.bridge.withdraw;
    if (!withdraw?.enabled) return null;
    return withdraw.inner;
  }, [activeApi]);

  useEffect(() => {
    const sub = activeApi?.relayingManager.listUpdated.subscribe(() => {
      Note.deserialize(params.note)
        .then((n) => {
          if (n) {
            withdrawApi?.getRelayersByNote(n).then((r) => {
              setRelayersState((p) => ({
                ...p,
                loading: false,
                relayers: r,
              }));
            });
          }
        })
        .catch((err) => {
          logger.info('catch note deserialize useWithdraw', err);
        });
    });
    return () => sub?.unsubscribe();
  }, [activeApi, params.note]);
  const { registerInteractiveFeedback } = useWebContext();
  // hook events
  useEffect(() => {
    Note.deserialize(params.note)
      .then((n) => {
        if (n) {
          withdrawApi?.getRelayersByNote(n).then((r) => {
            setRelayersState((p) => ({
              ...p,
              loading: false,
              relayers: r,
            }));
          });
        }
      })
      .catch((err) => {
        logger.info('catch note deserialize useWithdraw', err);
      });

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

    return () => Object.values(unsubscribe).forEach((v) => v && v());
  }, [withdrawApi]);

  const withdraw = useCallback(async () => {
    if (!withdrawApi) return;
    if (stage === WithdrawState.Ideal) {
      const { note, recipient } = params;
      try {
        const txReceipt = await withdrawApi.withdraw(note, recipient);
        setReceipt(txReceipt);
      } catch (e) {
        console.log('error from withdraw api', e);

        if (e.code === WebbErrorCodes.RelayerMisbehaving) {
          let interactiveFeedback: InteractiveFeedback = misbehavingRelayer();
          registerInteractiveFeedback(interactiveFeedback);
        }
      }
    }
  }, [withdrawApi, stage, params]);

  const canCancel = useMemo(() => {
    return stage < WithdrawState.SendingTransaction && stage > WithdrawState.Ideal;
  }, [stage]);

  const cancelWithdraw = useCallback(async () => {
    if (canCancel) {
      await withdrawApi?.cancelWithdraw();
    }
  }, [canCancel, withdrawApi]);
  const setRelayer = useCallback(
    (nextRelayer: WebbRelayer | null) => {
      withdrawApi?.setActiveRelayer(nextRelayer);
    },
    [withdrawApi]
  );
  return {
    stage,
    receipt,
    setReceipt,
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
