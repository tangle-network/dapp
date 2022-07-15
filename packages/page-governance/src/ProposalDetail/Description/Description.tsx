import { Typography } from '@mui/material';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import React from 'react';

import { Wrapper } from '../CastVote/styled';

export const Description: React.FC<{ description: string }> = ({ description }) => {
  const pallet = useColorPallet();

  return (
    <Wrapper>
      <Typography variant='h5' component='h6' style={{ fontWeight: 600 }}>
        Description
      </Typography>
      <p style={{ marginTop: '12px', color: pallet.primaryText }}>{description}</p>
    </Wrapper>
  );
};
