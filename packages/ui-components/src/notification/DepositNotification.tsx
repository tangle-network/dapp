import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';

const NotificationText = styled.p`
  font-size: 14px;
`;

type DepositNotificationProps = {
  chain: string;
  amount: number;
  currency: string;
};

export class DepositNotification extends React.Component<DepositNotificationProps> {
  render() {
    return (
      <div>
        <NotificationText>Depositing on: {this.props.chain}</NotificationText>
        <NotificationText>Size: {this.props.amount}</NotificationText>
        <NotificationText>Token: {this.props.currency}</NotificationText>
      </div>
    );
  }
}
