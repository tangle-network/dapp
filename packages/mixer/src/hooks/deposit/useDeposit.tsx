import { DepositPayload, MixerDeposit, MixerSize, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useDeposit = () => {
  const { activeApi } = useWebContext();
  const [loadingState, setLoadingState] = useState<MixerDeposit['loading']>('ideal');
  const [error, setError] = useState('');
  const [mixerSizes, setMixerSizes] = useState<MixerSize[]>([]);

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
    depositApi.getSizes().then((mixerSizes) => {
      setMixerSizes(mixerSizes);
    });
    return () => unSub && unSub();
  }, [depositApi]);

  const generateNote = useCallback(
    async (mixerId: number) => {
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
    mixerSizes,
    deposit,
    generateNote,
    loadingState,
    error,
  };
};
