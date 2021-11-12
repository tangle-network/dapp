import { Button, Divider, Icon, LinearProgress, Tooltip, Typography } from '@material-ui/core';
import { getEVMChainNameFromInternal } from '@webb-dapp/apps/configs';
import { WithdrawState } from '@webb-dapp/react-environment';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { DepositNote } from '@webb-tools/wasm-utils';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type WithdrawingModalProps = {
  canCancel: boolean;
  stage: WithdrawState;
  note: DepositNote;
  cancel(): void;
  withdrawTxInfo: any | null;
};

const WithdrawInfoWrapper = styled.div`
  width: 500px;
  min-height: 300px;
  position: relative;
  overflow: hidden;

  .modal-header {
    position: relative;
    width: 100%;
    background: ${({ theme }) => theme.mainBackground};
  }

  .withdraw-modal-header {
    padding-top: 1rem;
    font-family: ${FontFamilies.AvenirNext};
    text-align: center;
    font-weight: medium;
  }

  .withdraw-modal-header-complete {
    font-family: ${FontFamilies.AvenirNext};
    text-align: center;
    font-weight: medium;
  }

  .progress-content {
    padding: 0 2rem 1rem;
  }

  .withdraw-modal-header-caption {
    font-family: ${FontFamilies.AvenirNext};
    color: #7c7b86;
    text-align: center;
    padding-bottom: 1rem;
  }

  .cancel-button {
    position: absolute;
    bottom: 20px;
    right: 20px;
  }
`;

const TxCompleteContainer = styled.div`
  display: flex;
  height: 126px;
  justify-content: center;
  align-items: center;
`;

const TransactionSummaryWrapper = styled.div`
  padding: 1rem 2rem;
`;

const WithdrawInfoRow = styled.div`
  display: flex;
  width: 100%;
  padding: 0.2rem 0.2rem;
`;

const InfoItemLabel = styled.div`
  flex: 1 0 20%;
  justify-content: center;

  .label-icon {
    vertical-align: middle;
  padding: 1rem 0;

  td:nth-child(2) {
    padding: 0 2rem;
  }
`;

const InfoItem = styled.div`
  flex: 1 0 20%;
  justify-content: center;
  text-align: right;
`;

const alternatingMessages = [
  `Generating Zero Knowledge proofs takes around 1 minute`,
  'You may withdraw to another account',
  'Anyone with your note can withdraw, You should keep it secret',
];
const WithdrawingModal: React.FC<WithdrawingModalProps> = ({ canCancel, cancel, note, stage, withdrawTxInfo }) => {
  const [rm, setAlternatingMessage] = useState(0);
  useEffect(() => {
    const handle = setInterval(() => {
      setAlternatingMessage((p) => (p === alternatingMessages.length - 1 ? 0 : p + 1));
    }, 10000);
    return () => clearInterval(handle);
  }, []);
  const message = useMemo(() => {
    switch (stage) {
      case WithdrawState.Ideal:
        break;
      case WithdrawState.Done:
        return 'Transaction Done';
      case WithdrawState.Failed:
        return 'Transaction Failed';
      case WithdrawState.Cancelling:
        return 'Transaction canceled';
      case WithdrawState.GeneratingZk:
        return 'Generating Zero Knowledge proof...';
      case WithdrawState.SendingTransaction:
        return 'Transaction is being sent';
    }
  }, [stage]);
  const isResolved = useMemo(() => stage > WithdrawState.SendingTransaction, [stage]);
  const transactionString = useMemo(() => {
    if (!withdrawTxInfo) {
      return '';
    }

    const address = withdrawTxInfo.account;
    return `${address.slice(0, 6)}...${address.slice(address.length - 6, address.length)}`;
  }, [withdrawTxInfo]);

  return (
    <WithdrawInfoWrapper>
      <header className={'modal-header'}>
        {isResolved ? (
          <>
            <TxCompleteContainer>
              <Typography variant={'h4'} className={'withdraw-modal-header-complete'} color={'textPrimary'}>
                {message}
              </Typography>
            </TxCompleteContainer>
          </>
        ) : (
          <>
            <Typography variant={'h4'} className={'withdraw-modal-header'} color={'textPrimary'}>
              Transaction is being processed
            </Typography>
            <div className={'progress-content'}>
              <Typography variant={'h6'} className={'withdraw-modal-header-caption'}>
                {message}
              </Typography>
              <LinearProgress value={10} variant={'indeterminate'} />
              <Typography gutterBottom variant={'caption'}>
                {alternatingMessages[rm]}
              </Typography>
            </div>
          </>
        )}
      </header>
      <div>
        {withdrawTxInfo && (
          <TransactionSummaryWrapper>
            <Typography variant={'subtitle1'} color={'textPrimary'}>
              Transaction summary
            </Typography>
            <Divider />
            <WithdrawInfoRow>
              <InfoItemLabel>
                <Icon className={'label-icon'}>info</Icon> Bridge info:
              </InfoItemLabel>
              <InfoItem>
                <Typography variant={'caption'}>
                  <b>
                    Receiving {note.amount + ' ' + note.tokenSymbol} on{' '}
                    {getEVMChainNameFromInternal(Number(note.chain))}
                  </b>
                </Typography>
              </InfoItem>
            </WithdrawInfoRow>
            <WithdrawInfoRow>
              <InfoItemLabel>
                <Icon className={'label-icon'}>arrow_upward</Icon> Recipient Address:
              </InfoItemLabel>
              <InfoItem>
                <Tooltip title={withdrawTxInfo.account}>
                  <Typography variant={'caption'}>
                    <b>{transactionString}</b>
                  </Typography>
                </Tooltip>
              </InfoItem>
            </WithdrawInfoRow>
          </TransactionSummaryWrapper>
        )}
      </div>
      <Button
        onClick={() => {
          cancel();
        }}
        color='primary'
        disabled={!canCancel}
        className={'cancel-button'}
      >
        Cancel
      </Button>
    </WithdrawInfoWrapper>
  );
};
export default WithdrawingModal;
