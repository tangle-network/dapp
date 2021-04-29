import { Button, Paper, PaperProps, Snackbar } from '@material-ui/core';
import React from 'react';
import styled, { css } from 'styled-components';

type NotificationProps = {};
const AlertWrapper = styled.div<PaperProps>`
  padding: 1rem;
`;
export function Alert(props: any) {
  return <AlertWrapper as={Paper} elevation={6} variant='filled' {...props} />;
}
export const Notification: React.FC<NotificationProps> = ({}) => {
  return (
    <Snackbar
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      open={true}
      autoHideDuration={6000}
      onClose={() => {}}
    >
      <Alert>
        This is a success message!
        <Button>close</Button>
      </Alert>
    </Snackbar>
  );
};
