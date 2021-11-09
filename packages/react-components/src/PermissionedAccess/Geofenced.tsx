import Typography from '@material-ui/core/Typography';
import { ContentWrapper } from '@webb-dapp/ui-components/ContentWrappers/ContentWrapper';
import React from 'react';

type GeofencedProps = {};

export const Geofenced: React.FC<GeofencedProps> = () => {
  return (
    <ContentWrapper>
      <Typography variant={'h2'}>We are unable to service your jurisdiction</Typography>
    </ContentWrapper>
  );
};
