import { ChainId } from '@webb-dapp/apps/configs';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import {
  BridgeDeposit,
  DepositPayload,
  MixerDeposit,
  MixerSize,
  useWebContext,
} from '@webb-dapp/react-environment/webb-context';
import { BridgeCurrencyIndex } from '@webb-dapp/react-environment/webb-context/bridge/bridge-api';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { LoggerService } from '@webb-tools/app-util';
import { useCallback, useEffect, useMemo, useState } from 'react';

const logger = LoggerService.get('useBridgeDeposit');

export interface BridgeDepositApi {
  mixerSizes: MixerSize[];

  deposit(payload: DepositPayload): Promise<void>;

  generateNote(mixerId: number, destChain: ChainId, wrappableAsset: string | undefined): Promise<DepositPayload>;

  loadingState: MixerDeposit['loading'];
  error: string;
  depositApi: BridgeDeposit<any> | null;
  selectedBridgeCurrency: Currency | null;

  setSelectedCurrency(bridgeCurrency: BridgeCurrencyIndex | undefined): void;
}

export const useBridgeDeposit = (): BridgeDepositApi => {
  const { activeApi } = useWebContext();
  const [loadingState, setLoadingState] = useState<BridgeDeposit<any>['loading']>('ideal');
  const [error, setError] = useState('');
  const [mixerSizes, setMixerSizes] = useState<MixerSize[]>([]);
  const { bridgeApi, getTokensOfChain } = useBridge();
  const [selectedBridgeCurrency, setSelectedBridgeCurrency] = useState<null | Currency>(null);
  /// api
  const depositApi = useMemo(() => {
    const depositApi = activeApi?.methods.bridge.deposit;
    if (!depositApi?.enabled) return null;
    return depositApi.inner;
  }, [activeApi]);

  // hook events
  useEffect(() => {
    if (!depositApi || !bridgeApi) return;
    const unSub = depositApi.on('error', (error) => {
      setError(error);
    });

    depositApi.getSizes().then((mixerSizes) => {
      setMixerSizes(mixerSizes);
    });

    const subscribe = bridgeApi.$store.subscribe((bridge) => {
      depositApi.getSizes().then((mixerSizes) => {
        setMixerSizes(mixerSizes);
      });

      setSelectedBridgeCurrency(bridgeApi.currency);
    });
    return () => {
      unSub && unSub();
      subscribe.unsubscribe();
    };
  }, [depositApi, bridgeApi]);

  const generateNote = useCallback(
    async (mixerId: number, destChain: ChainId, wrappableAsset: string | undefined) => {
      if (!depositApi) {
        throw new Error('Not ready');
      }
      return depositApi?.generateBridgeNote(mixerId, destChain, wrappableAsset);
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
    const activeBridgeApi = bridgeApi;
    if (activeBridgeApi) {
      if (bridgeCurrency) {
        const nextBridge = activeBridgeApi.store.config[bridgeCurrency];
        console.log(activeBridgeApi.store);
        console.log({ nextBridge, bridgeCurrency });
        if (!nextBridge) {
          return;
        }
        activeBridgeApi.setActiveBridge(nextBridge);
      } else {
        activeBridgeApi.setActiveBridge(undefined);
      }
    }
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
