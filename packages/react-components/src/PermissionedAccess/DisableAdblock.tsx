import Typography from '@mui/material/Typography';
import { ContentWrapper } from '@webb-dapp/ui-components/ContentWrappers/ContentWrapper';
import React from 'react';

type DisableAdblockProps = {};

export const DisableAdblock: React.FC<DisableAdblockProps> = () => {
  return (
    <ContentWrapper>
      <Typography variant={'h1'}>Please disable adblock</Typography>
      <Typography variant={'h3'} style={{ paddingTop: '30px' }}>
        In order to comply with regulations, calls must be made to third-party APIs to prevent unauthorized users. Your
        adblock software is preventing these calls from happening.
      </Typography>
    </ContentWrapper>
  );
};
