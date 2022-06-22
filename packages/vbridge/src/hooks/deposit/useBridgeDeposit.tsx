import {
  AnchorDeposit,
  BridgeCurrencyIndex,
  ChainTypeId,
  computeChainIdType,
  Currency,
  DepositPayload,
  MixerDeposit,
  TransactionState,
  VAnchorDeposit,
} from '@webb-dapp/api-providers';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useWebContext } from '@webb-dapp/react-environment';
import { useCallback, useEffect, useMemo, useState } from 'react';
export interface VBridgeDepositApi {
  deposit(payload: DepositPayload): Promise<void>;

  generateNote(
    mixerId: number | string,
    destChain: ChainTypeId,
    amount: number,
    wrappableAsset: string | undefined
  ): Promise<DepositPayload>;

  stage: TransactionState;
  loadingState: MixerDeposit['loading'];
  error: string;
  depositApi: VAnchorDeposit<any> | null;
  selectedBridgeCurrency: Currency | null;

  setSelectedCurrency(bridgeCurrency: BridgeCurrencyIndex | undefined): void;
}

export const useBridgeDeposit = (): VBridgeDepositApi => {
  const [stage, setStage] = useState<TransactionState>(TransactionState.Ideal);
  const { activeApi } = useWebContext();
  const [loadingState, setLoadingState] = useState<AnchorDeposit<any>['loading']>('ideal');
  const [error, setError] = useState('');
  const { bridgeApi, getTokensOfChain } = useBridge();
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

    depositApi.on('stateChange', (state) => {
      setStage(state);
    });

    setSelectedBridgeCurrency(bridgeApi.currency);

    const subscribe = bridgeApi.$store.subscribe((bridge) => {
      setSelectedBridgeCurrency(bridgeApi.currency);
    });
    return () => {
      subscribe.unsubscribe();
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
      return depositApi?.deposit(depositPayload);
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
    stage,
    depositApi,
    deposit,
    generateNote,
    loadingState,
    error,
    selectedBridgeCurrency,
    setSelectedCurrency,
  };
};
