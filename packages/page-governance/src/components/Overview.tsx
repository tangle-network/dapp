import { usePageTitle } from '@webb-dapp/react-environment';
import { ArrowPixelIcon, Col, Row, styled, SubTitle } from '@webb-dapp/ui-components';
import { BareProps, ClickAbleProps } from '@webb-dapp/ui-components/types';
import React, { FC, useCallback } from 'react';
import { useNavigate } from 'react-router';

import { CouncilType } from '../config';
import { CouncilMembers } from './CouncilMembers';
import { CouncilesTab } from './CouncliTab';
import { GovernanceIntro } from './GovernanceIntro';
import { GovernanceStage } from './GovernanceStage';
import { RecentProposals } from './RecentProposals';

const OverviewSubTitleExtra = styled<FC<{ content: string } & BareProps & ClickAbleProps>>(
  ({ className, content, onClick }) => {
    return (
      <div className={className} onClick={onClick}>
        {content}
        <ArrowPixelIcon />
      </div>
    );
  }
)`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--color-primary);
  user-select: none;
  cursor: pointer;

  > svg {
    margin-left: 16px;
    height: 14px;
  }
`;

export const Overview: FC = () => {
  const naviagete = useNavigate();

  const goToCouncilDetailPage = useCallback(() => {
    naviagete('councils');
  }, [naviagete]);

  const goToAllProposals = useCallback(() => {
    naviagete('proposals');
  }, [naviagete]);

  const memberRender = useCallback((council: CouncilType) => <CouncilMembers council={council} />, []);

  // set page title
  usePageTitle({ content: 'Governance Overview' });

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <GovernanceStage />
      </Col>
      <Col span={24}>
        <SubTitle extra={<OverviewSubTitleExtra content='View All Proposals' onClick={goToAllProposals} />}>
          Recent Council Proposals
        </SubTitle>
        <RecentProposals />
      </Col>
      <Col span={24}>
        <SubTitle extra={<OverviewSubTitleExtra content='View All Councils' onClick={goToCouncilDetailPage} />}>
          Councils
        </SubTitle>
        <CouncilesTab contentRender={memberRender} />
      </Col>
      <Col span={24}>
        <GovernanceIntro />
      </Col>
    </Row>
  );
};
