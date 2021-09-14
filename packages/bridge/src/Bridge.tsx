import { Deposit, MixerTabs, Withdraw } from '@webb-dapp/bridge/components';
import { RelayerIpInfo } from '@webb-dapp/mixer/Mixer';
import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div``;
type MixerProps = {};

export const Bridge: React.FC<MixerProps> = () => {
  const { activeApi } = useWebContext();
  const [ip, setIp] = useState<RelayerIpInfo>({ ip: '' });

  useEffect(() => {
    async function getIpInfo() {
      const relayer = await activeApi?.relayingManager.getRelayer({})[0];
      if (relayer) {
        const response = await relayer.getIp();
        console.log(response);
        setIp(response);
      }
    }
    getIpInfo();
  }, [activeApi]);

  return (
    <MixerWrapper>
      <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} />
      <SpaceBox height={8} />
      <IPDisplay ip={ip.ip} />
    </MixerWrapper>
  );
};
