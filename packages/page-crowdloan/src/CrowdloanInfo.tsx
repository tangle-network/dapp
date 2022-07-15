import { alpha, Typography } from '@mui/material';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';

const SummaryWrapper = styled.section`
  padding: 8px 1rem;
  ${above.sm` padding: 16px 2rem; `}
  border-radius: 16px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${alpha(theme.borderColor, 0.1)};
  `}
`;

const StatisticsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 8px;
`;

const StatisticDataWrapper = styled.div`
  position: relative;
  margin-top: 8px;
  padding-left: 8px;

  .value {
    font-weight: 700;
    letter-spacing: -1px;
    line-height: 16px;
    margin-bottom: 4px;
  }

  .caption {
    color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : theme.primaryText)};
  }

  ::before {
    position: absolute;
    content: '';
    top: 0px;
    bottom: 0px;
    left: 0;
    width: 2px;
    border-radius: 2px;
    background-color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000')};
  }
`;

const OverviewWrapper = styled.section`
  margin-top: 20px;

  .overview-content {
    font-weight: 300;
    overflow: auto;
    white-space: pre-wrap;
    margin-top: 4px;
    color: ${({ theme }) => theme.secondaryText};
  }
`;

type StatProps = {
  value: string;
  caption: string;
};

const StatisticData: React.FC<StatProps> = ({ caption, value }) => {
  return (
    <StatisticDataWrapper>
      <Typography display='block' variant='h5' className='value'>
        {value}
      </Typography>
      <Typography display='block' variant='caption' className='caption'>
        {caption}
      </Typography>
    </StatisticDataWrapper>
  );
};

type CrowdloanInfoProps = {
  amountOfContribution?: number;
  numberOfContributors?: number;
};

export const CrowdloanInfo: React.FC<CrowdloanInfoProps> = ({ amountOfContribution, numberOfContributors }) => {
  const overViewString = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Non mauris eu, dui gravida pretium. Porttitor vulputate nulla
et, quam scelerisque morbi vitae ut ligula. Sit malesuada 
amet, magna enim a. Nullam vel metus egestas porttitor 
eget. Lectus cursus at id ut. Odio adipiscing viverra vehicula

egestas est ac lacinia et. Imperdiet scelerisque dictum 
vestibulum sagittis diam sed non non. 

Tortor laoreet malesuada varius vel, eu, aliquet est, dolor. 
Blandit sem sed et aenean.`;

  return (
    <Fragment>
      <SummaryWrapper>
        <Typography variant='h6' style={{ fontWeight: '700' }}>
          Summary
        </Typography>
        <StatisticsWrapper>
          <StatisticData value={amountOfContribution?.toLocaleString() ?? '-'} caption='Amout of Contribution in DOT' />
          <StatisticData value={numberOfContributors?.toLocaleString() ?? '-'} caption='Total contributors' />
        </StatisticsWrapper>
      </SummaryWrapper>
      <OverviewWrapper>
        <Typography variant='h6' style={{ fontWeight: '600' }}>
          Overview
        </Typography>
        <Typography variant='body1' component='pre' className='overview-content'>
          {overViewString}
        </Typography>
      </OverviewWrapper>
    </Fragment>
  );
};
