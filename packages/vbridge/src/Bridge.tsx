import { Deposit, Withdraw } from '@webb-dapp/bridge/components';
import { MixerTabs } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import React from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div``;
type MixerProps = {};

export const Bridge: React.FC<MixerProps> = () => {
  return (
    <MixerWrapper>
      <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} />
    </MixerWrapper>
  );
};
