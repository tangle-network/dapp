import React, { FC } from 'react';

import { Card, styled } from '@webb-dapp/ui-components';
import introSrc from '../assets/governance-intro-bg.svg';

const Title = styled.p`
  margin-bottom: 28px;
  font-size: 16px;
  line-height: 1.3125;
  font-weight: 500;
`;

const Content = styled.p`
  width: 350px;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-color-normal);
`;

const Img = styled.img`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  object-fit: cover;
`;

export const GovernanceIntro: FC = () => {
  return (
    <Card>
      <Title>Acala Governance</Title>
      <Content>
        Acala takes a phased approach to employ various governance mechanisms that will allow it to progressively
        decentralize and ultimately be commanded by the majority network stakeholders.
      </Content>
      <Img draggable={false} src={introSrc} />
    </Card>
  );
};
