import { useWebContext, WithdrawState } from '@webb-dapp/react-environment/webb-context';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Relayer } from '@webb-dapp/react-environment';

export type UseWithdrawProps = {
  note: string;
  recipient: string;
  relayer: Relayer;
};
export type WithdrawErrors = {
  error: string;

  validationError: {
    note: string;
    recipient: string;
  };
};
export const useWithdraw = (params: UseWithdrawProps) => {
  const [stage, setStage] = useState<WithdrawState>(WithdrawState.Ideal);
  const { activeApi } = useWebContext();

  const [error, setError] = useState<WithdrawErrors>({
    error: '',
    validationError: {
      note: '',
      recipient: '',
    },
  });
  const withdrawApi = useMemo(() => {
    const withdraw = activeApi?.methods.mixer.withdraw;
    if (!withdraw?.enabled) return null;
    return withdraw.inner;
  }, [activeApi]);

  // hook events
  useEffect(() => {
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
      const { note, recipient, relayer } = params;
      await withdrawApi.withdraw(note, recipient);
    }
  }, [withdrawApi, params, stage]);

  const canCancel = useMemo(() => {
    return stage < WithdrawState.SendingTransaction && stage > WithdrawState.Ideal;
  }, [stage]);

  const cancelWithdraw = useCallback(async () => {
    if (canCancel) {
      await withdrawApi?.cancelWithdraw();
    }
  }, [canCancel, withdrawApi]);

  return {
    stage,
    withdraw,
    canCancel,
    cancelWithdraw,
    error: error.error,
    validationErrors: error.validationError,
  };
};
