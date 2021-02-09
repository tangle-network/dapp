import { Col, Row, SubTitle } from '@webb-dapp/ui-components';
import React, { FC } from 'react';

import { TokenBalances } from './TokenBalances';
import { UserCard } from './UserCard';

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
