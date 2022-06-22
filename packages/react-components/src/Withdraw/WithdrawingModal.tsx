import { Button, Icon, LinearProgress, Tooltip, Typography } from '@material-ui/core';
import { getChainNameFromChainId, parseChainIdType } from '@webb-dapp/api-providers';
import { TransactionState } from '@webb-dapp/api-providers';
import { useAppConfig } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { JsNote as DepositNote } from '@webb-tools/wasm-utils';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type WithdrawingModalProps = {
  canCancel: boolean;
  stage: TransactionState;
  note: DepositNote;
  cancel(): void;
  withdrawTxInfo: any | null;
};

const WithdrawInfoWrapper = styled.div`
  width: 500px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.layer2Background};

  .modal-header {
    position: relative;
    width: 100%;
  }

  .withdraw-modal-header {
    padding-top: 1rem;
    font-family: ${FontFamilies.AvenirNext};
    text-align: center;
    font-weight: normal;
  }

  .withdraw-modal-header-complete {
    font-family: ${FontFamilies.AvenirNext};
    text-align: center;
    font-weight: normal;
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

  .linear-progress-styles,
  .MuiLinearProgress-colorPrimary {
    background-color: #ffffff;

    .MuiLinearProgress-bar {
      background-color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
    }
  }

  .cancel-button-container {
    display: flex;
    justify-content: flex-end;
  }

  .cancel-button {
    background: ${({ theme }) => theme.layer3Background};
    color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
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
  background: ${({ theme }) => theme.heavySelectionBackground};
  border-radius: 15px;
`;

const WithdrawInfoRow = styled.div`
  display: flex;
  width: 100%;
`;

const InfoItemLabel = styled.div`
  flex: 1 0 20%;
  justify-content: center;
  color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(255, 255, 255, 0.69)' : 'rgba(0, 0, 0, 0.69)')};
  font-size: 0.8rem;

  .label-icon {
    vertical-align: middle;
    padding: 1rem 0;
  }

  td:nth-child(2) {
    padding: 0 2rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex: 1 0 20%;
  justify-content: flex-end;
  text-align: right;
  align-items: center;
  color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
`;

export const WithdrawingModal: React.FC<WithdrawingModalProps> = ({
  canCancel,
  cancel,
  note,
  stage,
  withdrawTxInfo,
}) => {
  const message = useMemo(() => {
    switch (stage) {
      case TransactionState.Ideal:
        break;
      case TransactionState.Done:
        return 'Transaction Done';
      case TransactionState.Failed:
        return 'Transaction Failed';
      case TransactionState.Cancelling:
        return 'Transaction canceled';
      case TransactionState.GeneratingZk:
        return 'Generating Zero Knowledge proof...';
      case TransactionState.SendingTransaction:
        return 'Transaction is being sent';
    }
  }, [stage]);
  const isResolved = useMemo(() => stage > TransactionState.SendingTransaction, [stage]);
  const transactionString = useMemo(() => {
    if (!withdrawTxInfo) {
      return '';
    }

    const address = withdrawTxInfo.account;
    return `${address.slice(0, 6)}...${address.slice(address.length - 6, address.length)}`;
  }, [withdrawTxInfo]);
  const appConfig = useAppConfig();
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
              <b>Transaction is being processed</b>
            </Typography>
            <div className={'progress-content'}>
              <Typography variant={'h6'} className={'withdraw-modal-header-caption'}>
                {message}
              </Typography>
              <LinearProgress value={10} variant={'indeterminate'} className={'linear-progress-styles'} />
            </div>
          </>
        )}
      </header>
      <div>
        {withdrawTxInfo && (
          <TransactionSummaryWrapper>
            <Typography variant={'h6'} color={'textPrimary'}>
              <b>Transaction summary</b>
            </Typography>
            <WithdrawInfoRow>
              <InfoItemLabel>
                <Icon className={'label-icon'}>info</Icon> Bridge info:
              </InfoItemLabel>
              <InfoItem>
                <Typography variant={'caption'}>
                  <b>
                    Receiving {note.amount + ' ' + note.tokenSymbol} on{' '}
                    {getChainNameFromChainId(appConfig, parseChainIdType(Number(note.targetChainId)))}
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
      <SpaceBox height={10} />
      <div className={'cancel-button-container'}>
        <Button
          onClick={() => {
            cancel();
          }}
          disabled={!canCancel}
          className={'cancel-button'}
        >
          {stage > TransactionState.SendingTransaction ? 'Close' : 'Cancel'}
        </Button>
      </div>
    </WithdrawInfoWrapper>
  );
};
