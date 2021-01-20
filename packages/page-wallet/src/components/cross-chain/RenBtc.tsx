import React, { FC } from 'react';

import { Card, Tabs, useTabs, CardTabHeader } from '@webb-dapp/ui-components';

import { RenBtcMint } from './RenBtcMint';

type RenBTCTabType = 'mint' | 'release';

export const RenBtc: FC = () => {
  const { changeTabs, currentTab } = useTabs<RenBTCTabType>('mint');

  return (
    <Card padding={false}>
      <Tabs<RenBTCTabType> active={currentTab} divider={false} onChange={changeTabs}>
        <Tabs.Panel
          $key='mint'
          header={
            <CardTabHeader active={currentTab === 'mint'} disabled={false}>
              Mint
            </CardTabHeader>
          }
        >
          <RenBtcMint />
        </Tabs.Panel>
        <Tabs.Panel
          $key='release'
          header={
            <CardTabHeader active={currentTab === 'release'} disabled={true}>
              Release
            </CardTabHeader>
          }
        >
          <p>hello</p>
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
};
