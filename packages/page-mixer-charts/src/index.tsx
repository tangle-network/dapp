import React, { FC } from 'react';

import { Page, Row, Col } from '@webb-dapp/ui-components';
import { SwapPool } from './components/SwapPool';
import { SwapPoolDetail } from './components/SwapPoolDetail';

const PageWallet: FC = () => {
  return (
    <Page fullscreen>
      <Page.Title title='Swap Analysis' />
      <Page.Content>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <SwapPool />
          </Col>
          <Col span={24}>
            <SwapPoolDetail />
          </Col>
        </Row>
      </Page.Content>
    </Page>
  );
};

export default PageWallet;
