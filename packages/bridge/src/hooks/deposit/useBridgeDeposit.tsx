import { ChainId, chainIdIntoEVMId } from '@webb-dapp/apps/configs';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import {
  Bridge,
  BridgeDeposit,
  DepositPayload,
  MixerDeposit,
  MixerSize,
  useWebContext,
} from '@webb-dapp/react-environment/webb-context';
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
  setSelectedCurrency(nextBridgeCurrency: Currency): void;
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
      setActiveBridge(null);
      unSub && unSub();
      subscribe.unsubscribe();
    };
  }, [depositApi]);
  const [activeBridge, setActiveBridge] = useState<Bridge | null>(depositApi?.activeBridge ?? null);
  const generateNote = useCallback(
    async (mixerId: number, destChainType: ChainType, destChain: ChainId, wrappableAsset: string | undefined) => {
      if (!depositApi) {
        throw new Error('Not ready');
      }

      let destChainId: number;
      if (destChainType == ChainType.EVM) {
        const evmId = Number(chainIdIntoEVMId(destChain));
        destChainId = computeChainIdType(ChainType.EVM, evmId);
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

  const selectedBridgeCurrency = useMemo(() => {
    if (!activeBridge) {
      return null;
    }
    return activeBridge.currency;
  }, [activeBridge]);
  const setSelectedCurrency = (bridgeCurrency: Currency) => {
    logger.log('setSelectedCurrency: ', bridgeCurrency);
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
