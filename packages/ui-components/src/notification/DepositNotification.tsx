import React from 'react';
import { Typography } from '@material-ui/core';

type DepositNotificationProps = {
  chain: string;
  amount: number;
  currency: string;
};

export class DepositNotification extends React.Component<DepositNotificationProps> {
  render() {
    return (
      <div>
        <Typography variant={'h6'}>Depositing on: {this.props.chain} </Typography>
        <Typography variant={'h6'}>Size: {this.props.amount}</Typography>
        <Typography variant={'h6'}>Token: {this.props.currency}</Typography>
      </div>
    );
  }
}
