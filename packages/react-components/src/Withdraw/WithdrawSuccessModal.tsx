import { parseUnits } from '@ethersproject/units';
import { Button, Divider, Icon, Link, Typography } from '@material-ui/core';
import { chainsConfig } from '@webb-dapp/apps/configs';
import { ActiveWebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer/';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { LoggerService } from '@webb-tools/app-util';
import { JsNote as DepositNote } from '@webb-tools/wasm-utils';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const logger = LoggerService.get('Withdraw-Modal');

type WithdrawingModalProps = {
  note: DepositNote;
  recipient: string;
  receipt: string;
  relayer: ActiveWebbRelayer | null;
  exit(): void | Promise<void>;
};

const WithdrawInfoWrapper = styled.div`
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
    font-weight: normal;
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
  display: table;

  .MuiTypography-root {
    vertical-align: middle;
    display: table-cell;
  }

  .label-icon {
    vertical-align: middle;
    display: table-cell;
  padding: 1rem 0;

  td:nth-child(2) {
    padding: 0 2rem;
  }
`;

const InfoItem = styled.div`
  flex: 1 0 20%;
  display: table;
  height: 50px;
  justify-content: center;
  align-items: center;
  text-align: right;

  .MuiTypography-root {
    vertical-align: middle;
    display: table-cell;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const buttonStyle = {
  padding: '0px 20px 20px 0px',
  backgroundColor: 'transparent',
  color: 'green',
};

const WithdrawSuccessModal: React.FC<WithdrawingModalProps> = ({ exit, note, receipt, recipient, relayer }) => {
  const transactionString = (hexString: string) => {
    return `${hexString.slice(0, 6)}...${hexString.slice(hexString.length - 4, hexString.length)}`;
  };

  const getBlockExplorerTx = (txHash: string): string => {
    const chainId = Number(note.targetChainId);
    const url = chainsConfig[chainId]?.blockExplorerStub
      ? `${chainsConfig[chainId].blockExplorerStub}/tx/${txHash}`
      : '';
    return url;
  };

  const getBlockExplorerAddress = (address: string): string => {
    const chainId = Number(note.targetChainId);
    const url = chainsConfig[chainId]?.blockExplorerStub
      ? `${chainsConfig[chainId].blockExplorerStub}/address/${address}`
      : '';
    return url;
  };

  const [receivedAmount, setReceivedAmount] = useState('');

  useEffect(() => {
    const calculateReceivedAmount = async () => {
      if (!relayer) {
        setReceivedAmount(`${note.amount} ${note.tokenSymbol}`);
      } else {
        const fees = await relayer.fees(note.serialize());
        if (!fees) {
          setReceivedAmount(`${note.amount} ${note.tokenSymbol}`);
        } else {
          const principleBig = parseUnits(note.amount, note.denomination);
          const receivedAmount = principleBig.sub(fees.totalFees);
          setReceivedAmount(`${ethers.utils.formatUnits(receivedAmount, note.denomination)} ${note.tokenSymbol}`);
        }
      }
    };

    calculateReceivedAmount();
  });

  return (
    <WithdrawInfoWrapper>
      <header className={'modal-header'}>
        <TxCompleteContainer>
          <Typography variant={'h4'} className={'withdraw-modal-header'} color={'textPrimary'}>
            Transaction Successful!
          </Typography>
        </TxCompleteContainer>
      </header>
      <div>
        <TransactionSummaryWrapper>
          <Typography variant={'subtitle1'} color={'textPrimary'}>
            Transaction summary
          </Typography>
          <Divider />
          <WithdrawInfoRow>
            <InfoItemLabel>
              <Icon className={'label-icon'}>paid</Icon>
              <Typography variant={'h6'}>Received:</Typography>
            </InfoItemLabel>
            <InfoItem>
              <Typography variant={'h6'}>
                <b>{receivedAmount}</b>
              </Typography>
            </InfoItem>
          </WithdrawInfoRow>
          <WithdrawInfoRow>
            <InfoItemLabel>
              <Icon className={'label-icon'}>arrow_upward</Icon>
              <Typography variant={'h6'}>Recipient Address:</Typography>
            </InfoItemLabel>
            <InfoItem>
              <Link variant={'h6'} href={`${getBlockExplorerAddress(recipient)}`} target={'_blank'}>
                <b>{transactionString(recipient)}</b>
              </Link>
            </InfoItem>
          </WithdrawInfoRow>
          <WithdrawInfoRow>
            <InfoItemLabel>
              <Icon className={'label-icon'}>info</Icon>
              <Typography variant={'h6'}>Transaction Receipt:</Typography>
            </InfoItemLabel>
            <InfoItem>
              <Link variant={'h6'} href={`${getBlockExplorerTx(receipt)}`} target={'_blank'}>
                <b>{transactionString(receipt)}</b>
              </Link>
            </InfoItem>
          </WithdrawInfoRow>
        </TransactionSummaryWrapper>
      </div>
      <ButtonContainer>
        <Button
          onClick={() => {
            logger.info('User saw withdraw success modal and closed');
            exit();
          }}
          style={buttonStyle}
        >
          Confirm
        </Button>
      </ButtonContainer>
    </WithdrawInfoWrapper>
  );
};
export default WithdrawSuccessModal;
