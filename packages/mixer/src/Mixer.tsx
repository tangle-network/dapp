import React from 'react';
import styled from 'styled-components';
import { MixerProvider } from '@webb-dapp/mixer/containers';
import { MixerTabs } from '@webb-dapp/mixer/components';

const MixerWrapper = styled.div``;
type MixerProps = {};

export const Mixer: React.FC<MixerProps> = ({}) => {
  return (
    <MixerWrapper>
      <MixerProvider>
        <MixerTabs />
      </MixerProvider>
    </MixerWrapper>
  );
};
