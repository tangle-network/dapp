import { Typography } from '@material-ui/core';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import React from 'react';

import { Wrapper } from '../CastVote/styled';
import { Bar, BarWrapper, PercentValueWrapper, ResultWrapper } from './styled';

const PercentBar: React.FC<{ label: 'yes' | 'no'; percentValue: number }> = ({ label, percentValue }) => {
  return (
    <Flex row ai='center' style={{ marginBottom: '8px' }}>
      <PercentValueWrapper>{percentValue}%</PercentValueWrapper>
      <BarWrapper>
        <Bar percent={percentValue} label={label}>
          {label}
        </Bar>
      </BarWrapper>
    </Flex>
  );
};

export interface VoteResultProps {
  yesPercent: number;
  noPercent: number;
}

export const VoteResult: React.FC<VoteResultProps> = ({ noPercent, yesPercent }) => {
  return (
    <Wrapper>
      <Typography variant='h5' component='h6' style={{ fontWeight: 600 }}>
        Results
      </Typography>
      <ResultWrapper>
        <PercentBar label='yes' percentValue={yesPercent} />
        <PercentBar label='no' percentValue={noPercent} />
      </ResultWrapper>
    </Wrapper>
  );
};
