import { usePageTitle } from '@webb-dapp/react-environment';
import { ProposalData, useProposal } from '@webb-dapp/react-hooks';
import { Card, Col, FlexBox, Row, styled } from '@webb-dapp/ui-components';
import { upperFirst } from 'lodash';
import React, { FC } from 'react';
import { useParams } from 'react-router';

import { ProposalCard } from './ProposalCard';

const ArgumentsContent = styled.div`
  padding: 16px;
  font-size: 16px;
  line-height: 1.1875;
  color: var(--text-color-second);
  border: 1px solid #cccccc;
  border-radius: 8px;
`;

const VoteDetail = styled(({ vote }: ProposalData) => {
  return (
    <Card header='Vote Detail'>
      <FlexBox>
        <div>
          <FlexBox>
            <span>For</span>
            <span>{vote.ayes.length}</span>
          </FlexBox>
        </div>
        <div>
          <FlexBox>
            <span>Against</span>
            <span>{vote.nays.length}</span>
          </FlexBox>
        </div>
      </FlexBox>
    </Card>
  );
})``;

// const Action = (): JSX.Element => {
//   return (
//     <Row
//       gutter={[24, 24]}
//       justify='end'
//     >
//       <Col>
//         <Button>Yes</Button>
//       </Col>
//       <Col>
//         <Button>No</Button>
//       </Col>
//       <Col>
//         <Button>Close</Button>
//       </Col>
//     </Row>
//   );
// };

export const CouncilProposalDetail: FC = () => {
  const params = useParams();
  const [council, hash] = params.id ? params.id.split('-') : [];
  const data = useProposal(council, hash);

  usePageTitle({
    breadcrumb: [
      {
        content: 'Governance Overview',
        path: '/governance',
      },
      {
        content: 'Council Proposals',
        path: '/governance/proposals',
      },
    ],
    content: data ? upperFirst(data.proposal.methodName) : '',
  });

  if (!data) return null;

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <ProposalCard showAction={false} {...data} />
      </Col>
      <Col span={24}>
        <Card header='Arguments'>
          <ArgumentsContent>{JSON.stringify(data.proposal.toHuman())}</ArgumentsContent>
        </Card>
      </Col>
      <Col span={24}>
        <VoteDetail {...data} />
      </Col>
    </Row>
  );
};
