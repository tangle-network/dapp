import { Typography } from '@material-ui/core';
import React from 'react';

export interface SubstrateDemoCracyProps {}

export const SubstrateDemocracy: React.FC<SubstrateDemoCracyProps> = (props) => {
  return (
    <Typography variant='h5' component='h2' style={{ fontWeight: 700 }}>
      Proposals
    </Typography>
  );
};
