import React, { FC, useEffect } from 'react';

import { Col, Information, Row, useTabs } from '@webb-dapp/ui-components';
import { useSubMenu } from '@webb-dapp/react-environment';

import { DepositConsole } from './components/deposit';
import { WithdrawConsole } from './components/withdraw';
import { useMixer } from '@webb-dapp/react-hooks/useMixer';
import { useApi } from '@webb-dapp/react-hooks';
import { useFeatures } from '@webb-dapp/react-hooks';
import { CardRoot } from '@webb-dapp/page-mixer/components/common';

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
  const mixer = useMixer();
  const { chainInfo } = useApi();
  useEffect(() => {
    mixer
      .init()
      .then(() => {
        /*
         * todo handle mixer creation
         *
         * */
      })
      .catch(() => {
        /*
         * todo handle mixer Error
         *
         * */
      });
  }, []);

  useSubMenu({
    active: currentSubMenu,
    content: subMenu,
    onClick: changeSubMenu as (key: string) => void,
  });
  const isSupported = useFeatures(['mixer']);
  if (!isSupported) {
    return (
      <Information
        variant={'warning'}
        content={"Mixer isn't supported on  selected chain "}
        title='Unsupported Feature'
      />
    );
  }
  if (currentSubMenu === 'deposit') {
    return <DepositConsole />;
  }

  return (
    <Row gutter={[0, 24]}>
      {/* <Col span={24}>
          <LiquidityInformation />
        </Col> */}
      <Col span={24}>
        <WithdrawConsole />
      </Col>
    </Row>
  );
};

export default PageMixer;
