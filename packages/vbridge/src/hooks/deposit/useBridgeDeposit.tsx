import {
  AnchorDeposit,
  BridgeCurrencyIndex,
  ChainTypeId,
  computeChainIdType,
  Currency,
  DepositPayload,
  MixerDeposit,
  MixerSize,
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

  loadingState: MixerDeposit['loading'];
  error: string;
  depositApi: VAnchorDeposit<any> | null;
  selectedBridgeCurrency: Currency | null;

  setSelectedCurrency(bridgeCurrency: BridgeCurrencyIndex | undefined): void;
}

export const useBridgeDeposit = (): VBridgeDepositApi => {
  const { activeApi } = useWebContext();
  const [loadingState, setLoadingState] = useState<AnchorDeposit<any>['loading']>('ideal');
  const [error, setError] = useState('');
  const [mixerSizes, setMixerSizes] = useState<MixerSize[]>([]);
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
    const unSub = depositApi.on('error', (error) => {
      setError(error);
    });
    setSelectedBridgeCurrency(bridgeApi.currency);

    if (bridgeApi.activeBridge) {
      depositApi.getSizes().then((mixerSizes) => {
        mixerSizes.filter((mixerSize) => {
          mixerSize.id === selectedBridgeCurrency?.id;
        });
        setMixerSizes(mixerSizes);
      });
    }
    const subscribe = bridgeApi.$store.subscribe((bridge) => {
      depositApi.getSizes().then((mixerSizes) => {
        mixerSizes.filter((mixerSize) => {
          mixerSize.id === selectedBridgeCurrency?.id;
        });
        setMixerSizes(mixerSizes);
      });
      setSelectedBridgeCurrency(bridgeApi.currency);
    });
    return () => {
      unSub && unSub();
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
    depositApi,
    deposit,
    generateNote,
    loadingState,
    error,
    selectedBridgeCurrency,
    setSelectedCurrency,
  };
};
