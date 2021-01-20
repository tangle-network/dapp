import React, { FC } from 'react';
import styled from 'styled-components';

import { ReactComponent as ComingSoonImg } from './assets/coming-soon.svg';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center
`;

const Title = styled.p`
  margin: 67px 0 38px 0 !important;
  font-size: 24px;
  line-height: 29px;
  color: #434e59
`;

export const ComingSoon: FC = () => {
  return (
    <Root>
      <Title>Coming Soon…</Title>
      <ComingSoonImg />
    </Root>
  );
};

export const Empty: FC<{ title: string }> = ({ title }) => {
  return (
    <Root>
      <Title>{title}</Title>
      <ComingSoonImg />
    </Root>
  );
};
