import { Deposit, Withdraw } from '@webb-dapp/mixer/components';
import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { PermissionedAccess } from '@webb-dapp/react-components/PermissionedAccess/PermissionedAccess';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerTabs } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import React from 'react';
import styled from 'styled-components';

const MixerWrapper = styled.div``;
type MixerProps = {};

export const Mixer: React.FC<MixerProps> = () => {
  const { activeApi } = useWebContext();

  return (
    <MixerWrapper>
      <PermissionedAccess>
        <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} />
      </PermissionedAccess>
      <SpaceBox height={8} />
      <IPDisplay />
    </MixerWrapper>
  );
};
