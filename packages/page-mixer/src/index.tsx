import React, { FC, useLayoutEffect } from 'react';
import { useParams } from 'react-router';

import { Col, Row, Tabs, useTabs } from '@webb-dapp/ui-components';
import { useSubMenu } from '@webb-dapp/react-environment';

import { SwapConsole } from './components/swap';
import { DepositConsole } from './components/deposit';
import { WithdrawConsole } from './components/withdraw';
import { LiquidityInformation } from './components/common';

type SwapTabType = 'deposit' | 'withdraw';

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

const PageSwap: FC = () => {
  const { changeTabs, currentTab } = useTabs<SwapTabType>('deposit');
  const { changeTabs: changeSubMenu, currentTab: currentSubMenu } = useTabs<SwapTabType>('deposit');

  const params = useParams();

  useSubMenu({
    active: currentSubMenu,
    content: subMenu,
    onClick: changeSubMenu as (key: string) => void,
  });

  useLayoutEffect(() => {
    if (params.tab) {
      changeTabs(params.tab as SwapTabType);
    }
    /* eslint-disable-next-line */
  }, [changeTabs]);

  if (currentSubMenu === 'deposit') {
    return <SwapConsole />;
  }

  return (
    <Row gutter={[0, 24]}>
      <Col span={24}>
        <LiquidityInformation />
      </Col>
      <Col span={24}>
        <DepositConsole />
      </Col>
    </Row>
  );
};

export default PageSwap;
