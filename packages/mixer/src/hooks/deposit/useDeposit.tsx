import { MixerDeposit, WebbContentState } from '@webb-dapp/react-environment/webb-context';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useDeposit = () => {
  const { activeApi } = {} as WebbContentState;
  const [loadingState, setLoadingState] = useState<MixerDeposit<any>['loading']>('ideal');
  const [error, setError] = useState('');

  /// api
  const despotApi = useMemo(() => {
    const despotApi = activeApi?.methods.mixer.deposit;
    if (!despotApi?.enabled) return null;
    return despotApi.inner;
  }, [activeApi]);

  // hook events
  useEffect(() => {
    const unsubscribe: Record<string, (() => void) | void> = {};
    if (!despotApi) return;
    const unSub = despotApi.on('error', (error) => {
      setError(error);
    });
    return () => unSub && unSub();
  }, [despotApi]);

  const generateNote = useCallback(
    async (mixerid: number) => {
      return despotApi?.generateNote(mixerid);
    },
    [despotApi]
  );

  const deposit = useCallback(
    async (note: any) => {
      return despotApi?.deposit('');
    },
    [despotApi]
  );
  return {
    deposit,
    generateNote,
    loadingState,
    error,
  };
};
