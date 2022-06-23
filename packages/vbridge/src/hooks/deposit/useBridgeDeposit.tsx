import {
  BridgeCurrencyIndex,
  ChainTypeId,
  computeChainIdType,
  Currency,
  DepositPayload,
  MixerSize,
  VAnchorDeposit,
  VAnchorDepositResults,
  WebbError,
  WebbErrorCodes,
  WithdrawState,
} from '@webb-dapp/api-providers';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useWebContext } from '@webb-dapp/react-environment';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface VBridgeDepositApi {
  deposit(payload: DepositPayload): Promise<VAnchorDepositResults>;

  generateNote(
    mixerId: number | string,
    destChain: ChainTypeId,
    amount: number,
    wrappableAsset: string | undefined
  ): Promise<DepositPayload>;

  stage: VAnchorDeposit<any>['state'];
  error: string;
  depositApi: VAnchorDeposit<any> | null;
  selectedBridgeCurrency: Currency | null;

  setSelectedCurrency(bridgeCurrency: BridgeCurrencyIndex | undefined): void;
}

export const useBridgeDeposit = (): VBridgeDepositApi => {
  const { activeApi } = useWebContext();
  const [stage, setStage] = useState<WithdrawState>(WithdrawState.Ideal);
  const [error, setError] = useState('');
  // const [_mixerSizes, setMixerSizes] = useState<MixerSize[]>([]);
  const { bridgeApi } = useBridge();
  const [selectedBridgeCurrency, setSelectedBridgeCurrency] = useState<null | Currency>(null);
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
    if (!depositApi || !bridgeApi) {
      return;
    }
    const unSub = depositApi.on('error', (error) => {
      setError(error);
    });

    const stateChangeUnsub = depositApi.on('stateChange', (stage: WithdrawState) => {
      setStage(stage);
    });

    setSelectedBridgeCurrency(bridgeApi.currency);
    return () => {
      unSub && unSub();
      stateChangeUnsub && stateChangeUnsub();
    };
  }, [depositApi, bridgeApi, selectedBridgeCurrency?.id, bridgeApi?.activeBridge]);

  const generateNote = useCallback(
    async (
      anchorId: number | string,
      destChainTypeId: ChainTypeId,
      amount: number,
      wrappableAsset: string | undefined
    ) => {
      if (!depositApi) {
        throw new Error('Not ready');
      }
      const destChainId = computeChainIdType(destChainTypeId.chainType, destChainTypeId.chainId);
      return depositApi?.generateBridgeNote(anchorId, destChainId, amount, wrappableAsset);
    },
    [depositApi]
  );

  const deposit = useCallback(
    async (depositPayload: DepositPayload) => {
      if (!depositApi) {
        throw WebbError.from(WebbErrorCodes.UnsupportedChain);
      }
      return depositApi.deposit(depositPayload);
    },
    [depositApi]
  );

  const setSelectedCurrency = (bridgeCurrency: BridgeCurrencyIndex | undefined) => {
    if (bridgeApi) {
      if (bridgeCurrency) {
        const nextBridge = bridgeApi.store.config[bridgeCurrency] || undefined;
        bridgeApi.setActiveBridge(nextBridge);
      } else {
        bridgeApi.setActiveBridge(undefined);
      }
    }
  };

  return {
    depositApi,
    deposit,
    generateNote,
    stage,
    error,
    selectedBridgeCurrency,
    setSelectedCurrency,
  };
};
