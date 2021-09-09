import {
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

  generateNote(mixer: number): Promise<DepositPayload>;

  loadingState: MixerDeposit['loading'];
  error: string;
  depositApi: BridgeDeposit<any> | null;
}

export const useBridgeDeposit = (): BridgeDepositApi => {
  const { activeApi } = useWebContext();
  const [loadingState, setLoadingState] = useState<BridgeDeposit<any>['loading']>('ideal');
  const [error, setError] = useState('');
  const [mixerSizes, setMixerSizes] = useState<MixerSize[]>([]);

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
      console.log(mixerSizes);
      setMixerSizes(mixerSizes);
    });
    return () => unSub && unSub();
  }, [depositApi]);

  const generateNote = useCallback(
    async (mixerId: number) => {
      if (!depositApi) {
        throw new Error('Not ready');
      }
      return depositApi?.generateNote(mixerId);
    },
    [depositApi]
  );

  const deposit = useCallback(
    async (depositPayload: DepositPayload) => {
      return depositApi?.deposit(depositPayload);
    },
    [depositApi]
  );
  return {
    depositApi,
    mixerSizes,
    deposit,
    generateNote,
    loadingState,
    error,
  };
};
