import { Typography } from '@material-ui/core';
import React from 'react';

import { Wrapper } from '../CastVote/styled';

export const Description: React.FC<{ description: string }> = ({ description }) => {
  return (
    <Wrapper>
      <Typography variant='h5' component='h6' style={{ fontWeight: 600 }}>
        Description
      </Typography>
      <p style={{ marginTop: '12px' }}>{description}</p>
    </Wrapper>
  );
};
