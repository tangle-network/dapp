import React, { FC } from 'react';

import { Row, Col, SubTitle } from '@webb-dapp/ui-components';

import { UserCard } from './UserCard';
import { TokenBalances } from './TokenBalances';

export const WebbConsole: FC = () => {
  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <UserCard />
      </Col>
      <Col span={24}>
        <TokenBalances />
      </Col>
    </Row>
  );
};
