import { Capabilities, WebbRelayer } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { getRelayerManagerFactory } from '@webb-tools/relayer-manager-factory';
import { useCallback } from 'react';

type RelayerManagerApi = {
  getInfo: (endpoint: string) => Promise<Capabilities>;
  addRelayer: (endpoint: string) => Promise<WebbRelayer>;
};

export const useRelayerManager = (): RelayerManagerApi => {
  const { activeApi } = useWebContext();

  const addRelayer = useCallback(
    async (endpoint: string) => {
      const relayerManagerFactory = await getRelayerManagerFactory();
      const relayerCapabilities = await relayerManagerFactory.addRelayer(
        endpoint
      );
      const relayer = new WebbRelayer(endpoint, relayerCapabilities[endpoint]);
      activeApi?.relayerManager.addRelayer(relayer);
      return relayer;
    },
    [activeApi]
  );

  const getInfo = useCallback(async (endpoint: string) => {
    const relayerManagerFactory = await getRelayerManagerFactory();
    return relayerManagerFactory.fetchCapabilities(endpoint) ?? ({} as any);
  }, []);

  return {
    addRelayer,
    getInfo,
  };
};
