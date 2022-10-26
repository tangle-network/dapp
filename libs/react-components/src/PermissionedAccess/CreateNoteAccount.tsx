import Typography from '@mui/material/Typography';
import { ContentWrapper } from '@nepoche/ui-components/ContentWrappers/ContentWrapper';
import React from 'react';

export const CreateNoteAccount: React.FC = () => {
  return (
    <ContentWrapper>
      <Typography variant={'h1'}>Create a Note Account</Typography>
      <Typography variant={'h3'} style={{ paddingTop: '30px' }}>
        Users attempting to deposit must have a configured NoteAccount.
      </Typography>
    </ContentWrapper>
  );
};
