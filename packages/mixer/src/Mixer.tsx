import { Deposit, MixerTabs, Withdraw } from '@webb-dapp/mixer/components';
import React from 'react';
import styled from 'styled-components';
import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { SpaceBox } from '@webb-dapp/ui-components';

const MixerWrapper = styled.div``;
type MixerProps = {};

export const Mixer: React.FC<MixerProps> = () => {
  return (
    <MixerWrapper>
      <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} />
      <SpaceBox height={8} />
      <IPDisplay />
    </MixerWrapper>
  );
};
