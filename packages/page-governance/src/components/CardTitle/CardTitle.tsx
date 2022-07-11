import { Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { TextWrapper } from './styled';

export interface CardTitleProps {
  address: string;
  author: string;
  title: string;
  voteId: number;
}

export const CardTitle: React.FC<CardTitleProps> = ({ address, author, title, voteId }) => {
  const addressFormatter = useCallback((address: string, characters = 6) => {
    if (address.startsWith('0x')) {
      return address.length >= characters * 2 + 2
        ? `${address.slice(2, 2 + characters)}...${address.slice(-characters)}`
        : address;
    }

    return address.length >= characters * 2
      ? `${address.slice(0, characters)}...${address.slice(-characters)}`
      : address;
  }, []);

  return (
    <TextWrapper>
      <Typography variant='caption' component='p'>
        By {author} ~ x{addressFormatter(address)}
      </Typography>
      <Typography className='title' variant='h5' component='h6' style={{ fontWeight: 600, marginTop: '8px' }}>
        {title} ~ Vote ID: {voteId}
      </Typography>
    </TextWrapper>
  );
};
