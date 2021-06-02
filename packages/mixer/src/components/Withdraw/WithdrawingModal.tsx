import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Tooltip,
  Typography,
} from '@material-ui/core';

import { WithdrawState, WithdrawTXInfo } from '@webb-dapp/mixer';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

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
  `Generating Zero Knowledge proofs takes around 1 minute`,
  'You may withdraw to another account',
  'Anyone with your note can withdraw, You should keep it secret',
];
const WithdrawingModal: React.FC<WithdrawingModalProps> = ({ canCancel, cancel, stage, withdrawTxInfo }) => {
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

    const address = withdrawTxInfo.account;
    return `${address.slice(0, 20)}...${address.slice(address.length - 10, address.length)}`;
  }, [withdrawTxInfo]);
  return (
    <Dialog open={stage > WithdrawState.Ideal} fullWidth maxWidth={'sm'}>
      <DialogTitle>Transaction is being processed</DialogTitle>
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
            <Typography gutterBottom variant={'caption'}>
              <i>This usually takes 1 min</i>
            </Typography>
          </>
        )}

        {withdrawTxInfo && (
          <TransactionSummaryWrapper>
            <Typography variant={'subtitle1'} color={'textPrimary'}>
              Transaction summary
            </Typography>
            <table>
              <tr>
                <td>Mixer info:</td>
                {/*<td>
                  <Typography variant={'caption'}>
                    <b>
                      <i>Mixer id {withdrawTxInfo.note.id}</i>
                    </b>{' '}
                    has a denomination of{' '}
                    {selectedMixerItem &&
                      selectedMixerItem?.token.amount.toNumber() / 10 ** selectedMixerItem?.token.precision}{' '}
                    {selectedMixerItem && selectedMixerItem?.token.symbol}
                  </Typography>
                </td>*/}
              </tr>
              <tr>
                <td>Recipient Address:</td>
                <td>
                  <Tooltip title={withdrawTxInfo.account}>
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
