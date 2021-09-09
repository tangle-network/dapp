import { Deposit, MixerTabs, Withdraw } from '@webb-dapp/mixer/components';
import React from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div``;
type MixerProps = {};

export const Mixer: React.FC<MixerProps> = () => {
  return (
    <MixerWrapper>
      <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} />
    </MixerWrapper>
  );
};
