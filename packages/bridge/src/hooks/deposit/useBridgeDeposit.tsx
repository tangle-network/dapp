import { ChainId } from '@webb-dapp/apps/configs';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import {
  Bridge,
  BridgeCurrency,
  BridgeDeposit,
  DepositPayload,
  MixerDeposit,
  MixerSize,
  useWebContext,
} from '@webb-dapp/react-environment/webb-context';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface BridgeDepositApi {
  mixerSizes: MixerSize[];

  deposit(payload: DepositPayload): Promise<void>;

  generateNote(mixerId: number, destChain: ChainId): Promise<DepositPayload>;

  loadingState: MixerDeposit['loading'];
  error: string;
  depositApi: BridgeDeposit<any> | null;
  selectedBridgeCurrency: BridgeCurrency | null;
  setSelectedCurrency(nextBridgeCurrency: BridgeCurrency): void;
}

export const useBridgeDeposit = (): BridgeDepositApi => {
  const { activeApi } = useWebContext();
  const [loadingState, setLoadingState] = useState<BridgeDeposit<any>['loading']>('ideal');
  const [error, setError] = useState('');
  const [mixerSizes, setMixerSizes] = useState<MixerSize[]>([]);
  const bridgeApi = useBridge();

  /// api
  const depositApi = useMemo(() => {
    const depositApi = activeApi?.methods.bridge.deposit;
    if (!depositApi?.enabled) return null;
    return depositApi.inner;
  }, [activeApi]);

  // hook events
  useEffect(() => {
    if (!depositApi) return;
    const unSub = depositApi.on('error', (error) => {
      setError(error);
    });

    depositApi.getSizes().then((mixerSizes) => {
      setMixerSizes(mixerSizes);
    });

    const subscribe = depositApi.bridgeWatcher.subscribe((bridge) => {
      setActiveBridge(bridge);
      depositApi.getSizes().then((mixerSizes) => {
        setMixerSizes(mixerSizes);
      });
    });
    return () => {
      unSub && unSub();
      subscribe.unsubscribe();
    };
  }, [depositApi]);
  const [activeBridge, setActiveBridge] = useState<Bridge | null>(depositApi?.activeBridge ?? null);
  const generateNote = useCallback(
    async (mixerId: number, destChain: ChainId) => {
      if (!depositApi) {
        throw new Error('Not ready');
      }
      return depositApi?.generateBridgeNote(mixerId, destChain);
    },
    [depositApi]
  );

  const deposit = useCallback(
    async (depositPayload: DepositPayload) => {
      return depositApi?.deposit(depositPayload);
    },
    [depositApi]
  );

  const selectedBridgeCurrency = useMemo(() => {
    if (!activeBridge) {
      return null;
    }
    return activeBridge.currency;
  }, [activeBridge]);
  const setSelectedCurrency = (bridgeCurrency: BridgeCurrency) => {
    const bridge = bridgeApi.getBridge(bridgeCurrency);
    depositApi?.setBridge(bridge);
  };
  return {
    depositApi,
    mixerSizes,
    deposit,
    generateNote,
    loadingState,
    error,
    selectedBridgeCurrency,
    setSelectedCurrency,
  };
};
