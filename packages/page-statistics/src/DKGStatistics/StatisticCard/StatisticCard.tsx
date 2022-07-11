import { Typography } from '@mui/material';
import React from 'react';
import { CountUp } from 'use-count-up';

import { DescriptionIcon } from '../DescriptionIcon';
import { StatisticCardWrapper } from './styled';

export type StatisticCardProps = {
  title: string;
  value: string | number;
  description?: string;
  width?: string;
  labelColor?: string;
  styles?: React.CSSProperties;
};

export const StatisticCard: React.FC<StatisticCardProps> = ({
  description,
  labelColor,
  styles,
  title,
  value,
  width,
}) => {
  return (
    <StatisticCardWrapper width={width} labelColor={labelColor} style={styles}>
      <Typography variant='h4'>
        <b>{typeof value === 'number' ? <CountUp isCounting start={0} end={value} duration={2} /> : value}</b>
      </Typography>
      <Typography variant='h6'>
        {title} {description && <DescriptionIcon description={description} />}
      </Typography>
    </StatisticCardWrapper>
  );
};
