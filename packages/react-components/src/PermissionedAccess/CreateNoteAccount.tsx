import Typography from '@mui/material/Typography';
import { ContentWrapper } from '@webb-dapp/ui-components/ContentWrappers/ContentWrapper';
import React from 'react';

type CreateNoteAccountProps = {};

export const CreateNoteAccount: React.FC<CreateNoteAccountProps> = () => {
  return (
    <ContentWrapper>
      <Typography variant={'h1'}>Create a Note Account</Typography>
      <Typography variant={'h3'} style={{ paddingTop: '30px' }}>
        Users attempting to deposit must have a configured NoteAccount.
      </Typography>
    </ContentWrapper>
  );
};
