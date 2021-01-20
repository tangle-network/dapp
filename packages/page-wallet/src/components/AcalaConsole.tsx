import React, { FC } from 'react';

import { AirDrop } from './AirDrop';
import { Row, Col, SubTitle } from '@webb-dapp/ui-components';

import { UserCard } from './UserCard';
import { TokenBalances } from './TokenBalances';
import { LPBalances } from './LPBalances';

export const AcalaConsole: FC = () => {
  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <UserCard />
      </Col>

      <Col span={24}>
        <TokenBalances />
      </Col>

      <Col span={24}>
        <SubTitle>LP Tokens</SubTitle>
        <LPBalances />
      </Col>

      <Col span={24}>
        <AirDrop />
      </Col>
    </Row>
  );
};
