import { Deposit, TokenInfo, TokenStats, Withdraw } from '@webb-dapp/bridge/components';
import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { PermissionedAccess } from '@webb-dapp/react-components/PermissionedAccess/PermissionedAccess';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerTabs } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import { StatsTabs } from '@webb-dapp/ui-components/Tabs/StatsTabs';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';

const MixerWrapper = styled.div`
  width: 100%;
`;
type MixerProps = {};

export const Bridge: React.FC<MixerProps> = () => {
  const { activeApi, activeChain } = useWebContext();
  return (
    <MixerWrapper>
      <PermissionedAccess>
        <Flex row>
          <Flex flex={1}>
            <MixerTabs Withdraw={<Withdraw />} Deposit={<Deposit />} fullWidth />
          </Flex>
          <Padding x={4} />
          <Flex flex={1}>
            <StatsTabs TokenInfo={<TokenInfo />} TokenStats={<TokenStats />} fullWidth />
          </Flex>
        </Flex>
      </PermissionedAccess>
      <SpaceBox height={8} />
      <IPDisplay />
    </MixerWrapper>
  );
};
