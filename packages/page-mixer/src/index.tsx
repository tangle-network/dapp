import { useSubMenu } from '@webb-dapp/react-environment';
import { useFeatures } from '@webb-dapp/react-hooks';
import { useMixerGroups, useMixerProvider } from '@webb-dapp/react-hooks/useMixer';
import { Col, Information, Row, useTabs } from '@webb-dapp/ui-components';
import { Asset } from '@webb-tools/sdk-mixer';
import React, { FC, useEffect } from 'react';

import { DepositConsole } from './components/deposit';
import { WithdrawConsole } from './components/withdraw';

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

  const { changeTabs: changeSubMenu, currentTab: currentSubMenu } = useTabs<MixerPageType>('deposit');
  const { init } = useMixerProvider();
  const mixerGroups = useMixerGroups();

  useEffect(() => {
    console.log('Trying to start the mixer..');

    if (!isSupported) {
      return;
    }

    init()
      .then(async (mixer) => {
        /*
         * todo handle mixer creation
         *
         * */
        console.log(`generating note`);
        const note = await mixer.generateNote(new Asset(0, 'EDG'));
      })
      .catch((e) => {
        /*
         * todo handle mixer Error
         *
         * */
        console.log('Error: ', e);
      });
  }, [init, isSupported]);

  useSubMenu({
    active: currentSubMenu,
    content: subMenu,
    onClick: changeSubMenu as (key: string) => void,
  });

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
