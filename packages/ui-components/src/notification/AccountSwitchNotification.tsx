import { Typography } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const TextContainer = styled.div`
  word-break: break-all;
`;

type AccountSwitchNotificationProps = {
  account: string;
};

export class AccountSwitchNotification extends React.Component<AccountSwitchNotificationProps> {
  render() {
    return (
      <TextContainer>
        <Typography variant={'h6'}>active account is {this.props.account}</Typography>
      </TextContainer>
    );
  }
}
