import { Typography } from '@material-ui/core';
import { Deposit, MixerTabs, Withdraw } from '@webb-dapp/mixer/components';
import { MixerProvider } from '@webb-dapp/mixer/containers';
import { MerkleProvider } from '@webb-dapp/react-hooks/merkle/MekrleProvider';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import React from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div`
  .zk-bridge-message {
    text-align: center;
    padding: 1rem;
  }
  .zk-bridge-welcome-message {
    font-weight: 200 !important;
    letter-spacing: -0.075em !important;
    color: #474553;
  }
  .zk-bridge-welcome-message-info {
    font-family: ${FontFamilies.AvenirNext};
    font-weight: 600;
  }
`;
type MixerProps = {};

export const Mixer: React.FC<MixerProps> = ({}) => {
  return (
    <MixerWrapper>
      <MerkleProvider>
        <MixerProvider>
          <div className='zk-bridge-message'>
            <Typography variant={'h3'} className={'zk-bridge-welcome-message'}>
              Morning,<b>Wallet Name</b>
            </Typography>
            <Typography variant={'overline'} color={'primary'} className={'zk-bridge-welcome-message-info'}>
              You’re browsing zkBridge
            </Typography>
          </div>
          <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} />
        </MixerProvider>
      </MerkleProvider>
    </MixerWrapper>
  );
};
