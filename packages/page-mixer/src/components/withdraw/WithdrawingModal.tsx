import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Table,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { WithdrawState, WithdrawTXInfo } from '@webb-dapp/react-hooks/withdraw/useWithdraw';
import { Tooltip } from '@webb-dapp/ui-components/Tooltip';

type WithdrawingModalProps = {
  canCancel: boolean;
  stage: WithdrawState;
  cancel(): void;
  withdrawTxInfo: WithdrawTXInfo | null;
};
const CurrentRunningTaskWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const TransactionSummaryWrapper = styled.div`
  padding: 1rem 0;
  td:nth-child(2) {
    padding: 0 2rem;
  }
`;
const randomMessages = [
  `We have 1239 withdraws/deposit running right now`,
  `Generating Zero Knowledge proofs takes around  1 minute`,
  'You may withdraw to another account',
  'Anyone can having your note withdraw , You should keep it secret',
];
const WithdrawingModal: React.FC<WithdrawingModalProps> = ({ canCancel, cancel, withdrawTxInfo, stage }) => {
  const [rm, setRandomMessage] = useState(Math.floor(Math.random() * randomMessages.length));
  useEffect(() => {
    const handle = setInterval(() => {
      setRandomMessage((p) => (p === randomMessages.length - 1 ? 0 : p + 1));
    }, 10000);
    () => clearInterval(handle);
  }, []);
  const message = useMemo(() => {
    switch (stage) {
      case WithdrawState.Ideal:
        break;
      case WithdrawState.Done:
        return 'Translation Done';
      case WithdrawState.Faild:
        return 'Translation Failed';
      case WithdrawState.Canceled:
        return 'Translation canceled';
      case WithdrawState.GeneratingZk:
        return 'Generating Zero Knowledge proof';
      case WithdrawState.SendingTransaction:
        return 'Translation is being sent';
    }
  }, [stage]);
  const isResolved = useMemo(() => stage > WithdrawState.SendingTransaction, [stage]);
  const transactionString = useMemo(() => {
    if (!withdrawTxInfo) {
      return '';
    }
    const address = withdrawTxInfo.account.address;
    return `${address.slice(0, 20)}...${address.slice(address.length - 10, address.length)}`;
  }, [withdrawTxInfo]);
  return (
    <Dialog open={stage > WithdrawState.Ideal} fullWidth maxWidth={'sm'}>
      <DialogTitle>Transaction is being process</DialogTitle>
      <DialogContent>
        {isResolved ? (
          <Typography>{message}</Typography>
        ) : (
          <>
            <CurrentRunningTaskWrapper>
              <Typography>{message}</Typography>
            </CurrentRunningTaskWrapper>
            <Typography variant={'caption'}>{randomMessages[rm]}</Typography>
            <LinearProgress value={10} variant={'indeterminate'} />
            <Typography gutterBottom color={'textSecondary'} variant={'caption'}>
              <i>This usually takes 1 min</i>
            </Typography>
          </>
        )}

        {withdrawTxInfo && (
          <TransactionSummaryWrapper>
            <Typography variant={'subtitle1'}>Transaction summery</Typography>
            <table>
              <tr>
                <td>Mixer info:</td>
                <td>
                  <Typography variant={'caption'}>
                    <b>
                      <i>Mixer id {withdrawTxInfo.note.id}</i>
                    </b>{' '}
                    this worth 1000 EDG
                  </Typography>
                </td>
              </tr>
              <tr>
                <td>Recipient Account:</td>
                <td>
                  <span>
                    <Typography variant={'caption'}>{withdrawTxInfo.account.name}</Typography>
                  </span>
                </td>
              </tr>
              <tr>
                <td>Recipient Address</td>
                <td>
                  <Tooltip title={withdrawTxInfo.account.address}>
                    <Typography variant={'caption'}>{transactionString}</Typography>
                  </Tooltip>
                </td>
              </tr>
            </table>
          </TransactionSummaryWrapper>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            cancel();
          }}
          color='primary'
          disabled={!canCancel}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default WithdrawingModal;
