import {
  DepositPayload,
  NewNotesTxResult,
  Transaction,
  TransactionState,
  VAnchorDeposit,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useMemo, useState } from 'react';
import { useTxQueue } from '../transaction';

export interface VBridgeDepositApi {
  deposit(payload: DepositPayload): Promise<NewNotesTxResult>;
  cancel(): Promise<void>;
  generateNote(
    mixerId: number | string,
    destChainTypeId: number,
    amount: number,
    wrappableAsset: string | undefined
  ): Promise<DepositPayload>;
  stage: TransactionState;
  setStage(stage: TransactionState): void;
  error: string;
  depositApi: VAnchorDeposit<any> | null;
}

export const useBridgeDeposit = (): VBridgeDepositApi => {
  const { activeApi } = useWebContext();
  const [error] = useState('');
  const { txQueue, api: txQueueApi } = useTxQueue();

  const stage = useMemo(() => {
    console.log('use memo update`');
    return (
      txQueue[txQueue.length - 1]?.currentStatus[0] ?? TransactionState.Ideal
    );
  }, [txQueue]);

  /// api
  const depositApi = useMemo(() => {
    const depositApi = activeApi?.methods.variableAnchor.deposit;
    if (!depositApi?.enabled) {
      return null;
    }
    return depositApi.inner;
  }, [activeApi]);

  const generateNote = useCallback(
    async (
      anchorId: number | string,
      destChainTypeId: number,
      amount: number,
      wrappableAsset: string | undefined
    ) => {
      if (!depositApi) {
        throw new Error('Not ready');
      }
      return depositApi.generateBridgeNote(
        anchorId,
        destChainTypeId,
        amount,
        wrappableAsset
      );
    },
    [depositApi]
  );

  const deposit = useCallback(
    async (depositPayload: DepositPayload) => {
      if (!depositApi) {
        throw new Error('Api not ready');
      }
      const payload = depositApi.deposit(depositPayload);
      console.log(payload, 'deposit payload');
      if (payload instanceof Transaction) {
        txQueueApi.registerTransaction(payload);
      }
      return payload;
    },
    [depositApi, txQueueApi]
  );

  const cancel = useCallback(() => {
    if (!depositApi) {
      throw new Error('Api not ready');
    }
    return depositApi.cancel().catch(console.error);
  }, [depositApi]);
  console.log(stage, 'stage');
  return {
    stage,
    setStage: () => {},
    depositApi,
    deposit,
    generateNote,
    error,
    cancel,
  };
};
