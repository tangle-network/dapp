import React, { FC, useLayoutEffect } from 'react';
import { useParams } from 'react-router';

import { Col, Row, Tabs, useTabs } from '@webb-dapp/ui-components';
import { useSubMenu, MixerProvider } from '@webb-dapp/react-environment';

import { DepositConsole } from './components/deposit';
import { WithdrawConsole } from './components/withdraw';
import { LiquidityInformation } from './components/common';

type MixerPageType = 'deposit' | 'withdraw';

const subMenu = [
  {
    content: 'Deposit',
    key: 'deposit',
  },
  {
    content: 'Withdraw',
    key: 'withdraw',
  },
];

const PageMixer: FC = () => {
  const { changeTabs: changeSubMenu, currentTab: currentSubMenu } = useTabs<MixerPageType>('deposit');

  const params = useParams();

  useSubMenu({
    active: currentSubMenu,
    content: subMenu,
    onClick: changeSubMenu as (key: string) => void,
  });

  if (currentSubMenu === 'deposit') {
    return <DepositConsole />;
  }

  return (
    <MixerProvider>
      <Row gutter={[0, 24]}>
        {/* <Col span={24}>
          <LiquidityInformation />
        </Col> */}
        <Col span={24}>
          <WithdrawConsole />
        </Col>
      </Row>
    </MixerProvider>
  );
};

export default PageMixer;
