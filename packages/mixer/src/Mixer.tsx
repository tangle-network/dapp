import { Typography } from '@material-ui/core';
import { Deposit, MixerTabs, Withdraw } from '@webb-dapp/mixer/components';
import { MerkleProvider, MixerProvider } from '@webb-dapp/mixer/containers';
import React from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div`
`;
type MixerProps = {};

export const Mixer: React.FC<MixerProps> = () => {
  return (
    <MixerWrapper>
      <MerkleProvider>
        <MixerProvider>
          <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} />
        </MixerProvider>
      </MerkleProvider>
    </MixerWrapper>
  );
};
