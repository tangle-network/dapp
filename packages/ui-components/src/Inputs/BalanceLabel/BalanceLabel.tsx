import React from 'react';
import styled from 'styled-components';

import { sharedLabelCss } from '../shared';

const BalanceLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  font-weight: 300;
`;

const BalanceText = styled.span`
  display: block;
  color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : theme.primaryText)};
  ${sharedLabelCss}
`;

const BalanceValue = styled.span`
  display: block;
  border: 1px solid ${({ theme }) => theme.primaryText};
  border-radius: 5px;
  margin-left: 5px;
  padding: 0 5px;
  ${sharedLabelCss}
`;

export type BalanceLabelProp = {
  value: string;
};

export const BalanceLabel: React.FC<BalanceLabelProp> = ({ value }) => {
  return (
    <BalanceLabelWrapper>
      <BalanceText>Balance~</BalanceText>
      <BalanceValue>{value}</BalanceValue>
    </BalanceLabelWrapper>
  );
};
