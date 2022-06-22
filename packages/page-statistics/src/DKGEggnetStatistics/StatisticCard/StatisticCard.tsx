import { Typography } from '@material-ui/core';
import React from 'react';
import CountUp from 'react-countup';

import { DescriptionIcon } from '../DescriptionIcon';
import { StatisticCardWrapper } from './styled';

export type StatisticCardProps = {
  title: string;
  value: string | number;
  description: string;
};

export const StatisticCard: React.FC<StatisticCardProps> = ({ description, title, value }) => {
  return (
    <StatisticCardWrapper>
      <Typography variant='h6'>
        <b>
          {typeof value === 'number' ? (
            <CountUp start={0} end={value} delay={0} duration={1}>
              {({ countUpRef }) => (
                <div>
                  <span ref={countUpRef} />
                </div>
              )}
            </CountUp>
          ) : (
            value
          )}
        </b>
      </Typography>
      <Typography variant='subtitle2'>
        {title} <DescriptionIcon description={description} />
      </Typography>
    </StatisticCardWrapper>
  );
};
