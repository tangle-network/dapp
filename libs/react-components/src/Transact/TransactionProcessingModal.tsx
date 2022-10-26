import { Button, Checkbox, Typography } from '@mui/material';
import { TransactionState } from '@nepoche/dapp-types';
import { SpaceBox } from '@nepoche/ui-components/Box';
import { Spinner } from '@nepoche/ui-components/Spinner/Spinner';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type TxFlow = 'Deposit' | 'Withdraw' | 'Transfer';

const TransactionProcessingWrapper = styled.div`
  position: relative;
  overflow: hidden;
  padding: 1rem;
  background: ${({ theme }) => theme.layer2Background};

  .modal-header {
    position: relative;
    width: 100%;
  }

  .buttons-container {
    display: flex;
    justify-content: space-between;
  }

  .hide-button {
    background: ${({ theme }) => theme.layer3Background};
    color: green;
  }

  .cancel-button {
    background: ${({ theme }) => theme.layer3Background};
    color: red;
  }
`;

const InfoRow = styled.div`
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
  align-items: center;
  color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
`;

const TransactionSteps = styled.div`
  padding: 1rem 0;
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
`;

type CheckedStepProps = {
  children: React.ReactNode;
  targetState: number;
  currentState: number;
};

const SpinnerCheckBoxItem: React.FC<CheckedStepProps> = ({ children, currentState, targetState }) => {
  return (
    <ItemWrapper>
      {targetState > currentState && <Checkbox disabled></Checkbox>}
      {targetState === currentState && (
        <Checkbox
          disabled
          icon={
            <div style={{ height: '18px', width: '18px' }}>
              <Spinner />
            </div>
          }
        ></Checkbox>
      )}
      {targetState < currentState && <Checkbox disabled checked></Checkbox>}
      {children}
    </ItemWrapper>
  );
};

type TransactionProcessingModalProps = {
  txFlow: TxFlow;
  state: TransactionState;
  amount: number;
  sourceChain: string;
  destChain: string;
  cancel(): void | Promise<void>;
  hide(): void | Promise<void>;
};

export const TransactionProcessingModal: React.FC<TransactionProcessingModalProps> = ({
  amount,
  cancel,
  destChain,
  hide,
  sourceChain,
  state,
  txFlow,
}) => {
  const isCancelled = useMemo(() => {
    return state === TransactionState.Cancelling;
  }, [state]);

  return (
    <TransactionProcessingWrapper>
      <header className={'modal-header'}>
        <Typography variant={'h4'} className={'withdraw-modal-header'} color={'textPrimary'}>
          {txFlow}
        </Typography>
        <Typography variant={'h6'} color={'textPrimary'}>
          {isCancelled ? 'Transaction Cancelled' : 'Processing...'}
        </Typography>
      </header>
      <TransactionSteps>
        <SpinnerCheckBoxItem targetState={TransactionState.FetchingFixtures} currentState={state}>
          <Typography variant={'h6'}>Fetching Zero-Knowledge Fixtures</Typography>
        </SpinnerCheckBoxItem>
        <SpinnerCheckBoxItem targetState={TransactionState.FetchingLeaves} currentState={state}>
          <Typography variant={'h6'}>Fetching Leaves</Typography>
        </SpinnerCheckBoxItem>
        <SpinnerCheckBoxItem targetState={TransactionState.GeneratingZk} currentState={state}>
          <Typography variant={'h6'}>Generating Zero-Knowledge Proof</Typography>
        </SpinnerCheckBoxItem>
        <SpinnerCheckBoxItem targetState={TransactionState.SendingTransaction} currentState={state}>
          <Typography variant={'h6'}>Sending Transaction</Typography>
        </SpinnerCheckBoxItem>
      </TransactionSteps>
      <InfoRow>
        <InfoItemLabel>
          <b>{txFlow} amount</b>
        </InfoItemLabel>
        <InfoItem>
          <Typography variant={'caption'}>{amount}</Typography>
        </InfoItem>
      </InfoRow>
      <InfoRow>
        <InfoItemLabel>
          <b>Chains</b>
        </InfoItemLabel>
        <InfoItem>
          <Typography variant={'caption'}>{`${sourceChain} -> ${destChain}`}</Typography>
        </InfoItem>
      </InfoRow>
      <SpaceBox height={10} />
      <div className={'buttons-container'}>
        <Button
          onClick={() => {
            hide();
          }}
          className={'hide-button'}
        >
          Hide
        </Button>
        <Button
          onClick={() => {
            isCancelled ? hide() : cancel();
          }}
          className={'cancel-button'}
        >
          {isCancelled ? 'Close' : 'Cancel'}
        </Button>
      </div>
    </TransactionProcessingWrapper>
  );
};
