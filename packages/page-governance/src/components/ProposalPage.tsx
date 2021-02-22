import { usePageTitle } from '@webb-dapp/react-environment';
import { useProposals } from '@webb-dapp/react-hooks';
import { Col, Row } from '@webb-dapp/ui-components';
import React, { FC, useCallback } from 'react';

import { CouncilType } from '../config';
import { CouncilesTab } from './CouncliTab';
import { ProposalCard } from './ProposalCard';

const ProposalList: FC<{ council: string }> = ({ council }) => {
  const proposals = useProposals(council);

  return (
    <Row gutter={[24, 24]}>
      {proposals.map((item, index) => (
        <Col key={`proposal-${item.council}-${index}`} span={24}>
          <ProposalCard {...item} />
        </Col>
      ))}
    </Row>
  );
};

export const ProposalPage: FC = () => {
  usePageTitle({
    breadcrumb: [
      {
        content: 'Governance Overview',
        path: '/governance',
      },
    ],
    content: 'Council Proposals',
  });
  const councilRender = useCallback((council: CouncilType) => <ProposalList council={council} />, []);

  return <CouncilesTab contentRender={councilRender} />;
};
