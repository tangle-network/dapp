import { DepositPayload, MixerDeposit, MixerTitle, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface DepositApi {
  mixerTitles: MixerTitle[];

  deposit(payload: DepositPayload): Promise<void>;

  generateNote(mixer: number): Promise<DepositPayload>;

  loadingState: MixerDeposit['loading'];
  error: string;
}

export const useDeposit = (): DepositApi => {
  const { activeApi } = useWebContext();
  const [loadingState, setLoadingState] = useState<MixerDeposit['loading']>('ideal');
  const [error, setError] = useState('');
  const [mixerTitles, setMixerTitles] = useState<MixerTitle[]>([]);

  /// api
  const depositApi = useMemo(() => {
    const depositApi = activeApi?.methods.mixer.deposit;
    if (!depositApi?.enabled) return null;
    return depositApi.inner;
  }, [activeApi]);

  // hook events
  useEffect(() => {
    if (!depositApi) return;
    const unSub = depositApi.on('error', (error) => {
      setError(error);
    });
    depositApi.getTitles().then((mixerTitles) => {
      console.log(mixerTitles);
      setMixerTitles(mixerTitles);
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
    mixerTitles,
    deposit,
    generateNote,
    loadingState,
    error,
  };
};
