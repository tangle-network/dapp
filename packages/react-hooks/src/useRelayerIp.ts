import { WebbApiProvider } from '@webb-dapp/react-environment';
import { useEffect, useState } from 'react';

export type RelayerIpInfo = {
  ip: string;
};

export function useRelayerIp(activeApi?: WebbApiProvider<any>) {
  const [ip, setIp] = useState<RelayerIpInfo>({ ip: '' });

  useEffect(() => {
    async function getIpInfo() {
      const relayer = await activeApi?.relayingManager.getRelayer({})[0];
      if (relayer) {
        const response = await relayer.getIp();
        // @ts-ignore
        setIp(response);
      }
    }
    getIpInfo();
  }, [activeApi]);
  return ip;
}
