import Typography from '@material-ui/core/Typography';
import { ContentWrapper } from '@webb-dapp/ui-components/ContentWrappers/ContentWrapper';
import React from 'react';

type DisableAdblockProps = {};

export const DisableAdblock: React.FC<DisableAdblockProps> = () => {
  return (
    <ContentWrapper>
      <Typography variant={'h2'}>Disable adblock to use the DApp so we may correctly identify your location</Typography>
    </ContentWrapper>
  );
};
