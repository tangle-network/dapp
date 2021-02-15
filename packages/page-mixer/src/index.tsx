import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import { useSubMenu } from '@webb-dapp/react-environment';
import { useMixer, useMixerGroups, useMixerProvider } from '@webb-dapp/react-hooks/useMixer';
import { Col, Loading, Row, useTabs } from '@webb-dapp/ui-components';
import React, { FC, useEffect, useLayoutEffect } from 'react';
import { useParams } from 'react-router';

import { LiquidityInformation } from './components/common';
import { DepositConsole } from './components/deposit';

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

const PageMixer: FC = () => {
  const { changeTabs, currentTab } = useTabs<SwapTabType>('deposit');
  const { changeTabs: changeSubMenu, currentTab: currentSubMenu } = useTabs<SwapTabType>('deposit');

  const mixer = useMixer();

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

  if (mixer.loading) {
    return <Loading />;
  }

  if (currentSubMenu === 'deposit') {
    return <DepositConsole />;
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

export default pageWithFeatures({
  features: ['mixer'],
  message: "Mixer isn't supported on the current cain ,please consider change the current network",
})(PageMixer);
