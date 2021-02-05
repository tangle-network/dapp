import React, { FC, useEffect } from 'react';

import { Col, Information, Row, useTabs } from '@webb-dapp/ui-components';
import { useSubMenu } from '@webb-dapp/react-environment';

import { DepositConsole } from './components/deposit';
import { WithdrawConsole } from './components/withdraw';
import { useMixer } from '@webb-dapp/react-hooks/useMixer';
import { useFeatures } from '@webb-dapp/react-hooks';
import { Asset } from '@webb-tools/sdk-mixer';

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
  const { changeTabs: changeSubMenu, currentTab: currentSubMenu } = useTabs<MixerPageType>('deposit');
  const { init } = useMixer();
  useEffect(() => {
    console.log('Trying to start the mixer..');
      init().then(mixer => {
        /*
         * todo handle mixer creation
         *
         * */
        const note = mixer.generateNote(new Asset(0, 'EDG'));
        console.log('Note: ', note);
      })
      .catch((e) => {
        /*
         * todo handle mixer Error
         *
         * */
        console.log('Error: ', e);
      });
  }, []);

  useSubMenu({
    active: currentSubMenu,
    content: subMenu,
    onClick: changeSubMenu as (key: string) => void,
  });
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
