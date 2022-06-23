import { Typography } from '@material-ui/core';
import React from 'react';
import CountUp from 'react-countup';

import { DescriptionIcon } from '../DescriptionIcon';
import { StatisticCardWrapper } from './styled';

export type StatisticCardProps = {
  title: string;
  value: string | number;
  description?: string;
  width?: string;
};

export const StatisticCard: React.FC<StatisticCardProps> = ({ description, title, value, width }) => {
  return (
    <StatisticCardWrapper width={width}>
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
        {title} {description && <DescriptionIcon description={description} />}
      </Typography>
    </StatisticCardWrapper>
  );
};
