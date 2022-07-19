import { ChainTypeId, computeChainIdType, DepositPayload, MixerDeposit, MixerSize } from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useBridge } from '@webb-dapp/vbridge/hooks/bridge/use-bridge';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface DepositApi {
  mixerSizes: MixerSize[];

  deposit(payload: DepositPayload): Promise<void>;

  generateNote(mixer: number | string, chainTypeId: ChainTypeId): Promise<DepositPayload>;

  loadingState: MixerDeposit['loading'];
  error: string;
  ready: boolean;
}

export const useDeposit = (): DepositApi => {
  const { activeApi } = useWebContext();
  const [loadingState, setLoadingState] = useState<MixerDeposit['loading']>('ideal');
  const [error, setError] = useState('');
  const [mixerSizes, setMixerSizes] = useState<MixerSize[]>([]);
  const { bridgeApi } = useBridge();

  /// api
  const depositApi = useMemo(() => {
    const depositApi = activeApi?.methods.mixer.deposit;
    if (!depositApi?.enabled) {
      return null;
    }
    return depositApi.inner;
  }, [activeApi]);

  // hook events
  useEffect(() => {
    if (!depositApi) {
      return;
    }
    const unSub = depositApi.on('error', (error) => {
      setError(error);
    });
    depositApi.getSizes().then((mixerSizes) => {
      setMixerSizes(mixerSizes);
    });
    return () => unSub && unSub();
  }, [depositApi, bridgeApi?.activeBridge]);

  const generateNote = useCallback(
    async (mixerId: number | string, chainTypeId: ChainTypeId) => {
      if (!depositApi) {
        // TODO: fix this to be dependent on the api state
        // disable buttons
        throw new Error('Not ready');
      } else {
        const encodedChainIdType = computeChainIdType(chainTypeId.chainType, chainTypeId.chainId);
        return depositApi?.generateNote(mixerId, encodedChainIdType);
      }
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
    ready: Boolean(activeApi),
  };
};
