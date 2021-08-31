import { Deposit, MixerTabs, Withdraw } from '@webb-dapp/mixer/components';
import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div``;
type MixerProps = {};

type RelayerIpInfo = {
  ip: String;
};

export const Mixer: React.FC<MixerProps> = () => {
  const { activeApi } = useWebContext();
  const [ip, setIp] = useState<RelayerIpInfo>({ ip: '' });

  useEffect(() => {
    async function getIpInfo() {
      const relayer = await activeApi?.relayingManager.getRelayer({})[0];
      if (relayer) {
        const response = await relayer.getIp();
        console.log(response);
        setIp({ ip: response });
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
