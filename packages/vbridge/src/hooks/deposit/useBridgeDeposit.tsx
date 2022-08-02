import {
  Currency,
  DepositPayload,
  TransactionState,
  VAnchorDeposit,
  VAnchorDepositResults,
} from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment';
import { useCallback, useEffect, useMemo, useState } from 'react';
export interface VBridgeDepositApi {
  deposit(payload: DepositPayload): Promise<VAnchorDepositResults>;

  generateNote(
    mixerId: number | string,
    destChainTypeId: number,
    amount: number,
    wrappableAsset: string | undefined
  ): Promise<DepositPayload>;
  stage: TransactionState;
  setStage(stage: TransactionState): void;
  setWrappableCurrency(currency: Currency): void;
  setGovernedCurrency(currency: Currency): void;
  error: string;
  depositApi: VAnchorDeposit<any> | null;
}

export const useBridgeDeposit = (): VBridgeDepositApi => {
  const [stage, setStage] = useState<TransactionState>(TransactionState.Ideal);
  const { activeApi } = useWebContext();
  const [error] = useState('');

  /// api
  const depositApi = useMemo(() => {
    const depositApi = activeApi?.methods.variableAnchor.deposit;
    if (!depositApi?.enabled) {
      return null;
    }
    return depositApi.inner;
  }, [activeApi]);

  // hook events
  useEffect(() => {
    if (!depositApi) {
      return;
    }

    depositApi.on('stateChange', (state) => {
      setStage(state);
    });

    return () => {
      depositApi.unsubscribeAll();
    };
  }, [depositApi]);

  const generateNote = useCallback(
    async (anchorId: number | string, destChainTypeId: number, amount: number, wrappableAsset: string | undefined) => {
      if (!depositApi) {
        throw new Error('Not ready');
      }
      return depositApi.generateBridgeNote(anchorId, destChainTypeId, amount, wrappableAsset);
    },
    [depositApi]
  );

  const deposit = useCallback(
    async (depositPayload: DepositPayload) => {
      if (!depositApi) {
        throw new Error('Api not ready');
      }
      return depositApi.deposit(depositPayload);
    },
    [depositApi]
  );

  const setWrappableCurrency = useCallback(
    async (currency: Currency | null) => {
      if (activeApi) {
        activeApi.state.wrappableCurrency = currency;
      }
    },
    [activeApi]
  );

  const setGovernedCurrency = useCallback(
    (currency: Currency): void => {
      if (!activeApi || !activeApi.state.activeBridge) {
        return;
      }

      activeApi.methods.bridgeApi.setBridgeByCurrency(currency);
    },
    [activeApi]
  );

  return {
    stage,
    setStage,
    depositApi,
    setWrappableCurrency,
    setGovernedCurrency,
    deposit,
    generateNote,
    error,
  };
};
