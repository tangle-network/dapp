import { Typography } from '@material-ui/core';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import React, { useCallback, useMemo } from 'react';
import { CountUp, Props as CountUpProps, useCountUp } from 'use-count-up';

import { Wrapper } from '../CastVote/styled';
import { Bar, BarWrapper, PercentValueWrapper, ResultWrapper } from './styled';

const PercentBar: React.FC<{ label: 'yes' | 'no'; percentValue: number }> = ({ label, percentValue }) => {
  const countFormatter = useCallback((value: number) => `${Math.floor(value)}%`, []);
  const commonCountUpProps = useMemo<Partial<CountUpProps>>(
    () => ({
      isCounting: true,
      end: percentValue,
      duration: 1.5,
      decimalPlaces: 0,
    }),
    [percentValue]
  );
  const { value } = useCountUp(commonCountUpProps);

  return (
    <Flex row ai='center' style={{ marginBottom: '8px' }}>
      <PercentValueWrapper>
        <CountUp formatter={countFormatter} {...commonCountUpProps} />
      </PercentValueWrapper>
      <BarWrapper>
        <Bar percent={parseInt(value?.toString() ?? '', 10)} label={label}>
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
