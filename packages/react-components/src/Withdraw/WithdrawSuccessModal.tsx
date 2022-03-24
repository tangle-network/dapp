import { parseUnits } from '@ethersproject/units';
import { Button, Divider, Icon, Link, Typography } from '@material-ui/core';
import { chainsConfig, chainTypeIdToInternalId, InternalChainId, parseChainIdType } from '@webb-dapp/apps/configs';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { ActiveWebbRelayer } from '@webb-tools/api-providers/webb-context/relayer';
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
    color: green;
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

export const WithdrawSuccessModal: React.FC<WithdrawingModalProps> = ({ exit, note, receipt, recipient, relayer }) => {
  const transactionString = (hexString: string) => {
    return `${hexString.slice(0, 6)}...${hexString.slice(hexString.length - 4, hexString.length)}`;
  };

  const getBlockExplorerTx = (txHash: string): string => {
    let chainId: InternalChainId;
    try {
      chainId = chainTypeIdToInternalId(parseChainIdType(Number(note.targetChainId)));
    } catch (e) {
      chainId = Number(note.targetChainId);
    }
    const url = chainsConfig[chainId]?.blockExplorerStub
      ? `${chainsConfig[chainId].blockExplorerStub}/tx/${txHash}`
      : '';
    return url;
  };

  const getBlockExplorerAddress = (address: string): string => {
    let chainId: InternalChainId;
    try {
      chainId = chainTypeIdToInternalId(parseChainIdType(Number(note.targetChainId)));
    } catch (e) {
      chainId = Number(note.targetChainId);
    }
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
          <Typography variant={'h6'} color={'textPrimary'}>
            Transaction summary
          </Typography>
          <WithdrawInfoRow>
            <InfoItemLabel>
              <Icon className={'label-icon'}>paid</Icon>Received:
            </InfoItemLabel>
            <InfoItem>
              <Typography variant={'h6'}>
                <b>{receivedAmount}</b>
              </Typography>
            </InfoItem>
          </WithdrawInfoRow>
          <WithdrawInfoRow>
            <InfoItemLabel>
              <Icon className={'label-icon'}>arrow_upward</Icon>Recipient Address:
            </InfoItemLabel>
            <InfoItem>
              <Link underline='always' variant={'h6'} href={`${getBlockExplorerAddress(recipient)}`} target={'_blank'}>
                <b>{transactionString(recipient)}</b>
              </Link>
            </InfoItem>
          </WithdrawInfoRow>
          <WithdrawInfoRow>
            <InfoItemLabel>
              <Icon className={'label-icon'}>info</Icon>Transaction Receipt:
            </InfoItemLabel>
            <InfoItem>
              <Link underline='always' variant={'h6'} href={`${getBlockExplorerTx(receipt)}`} target={'_blank'}>
                <b>{transactionString(receipt)}</b>
              </Link>
            </InfoItem>
          </WithdrawInfoRow>
        </TransactionSummaryWrapper>
      </div>
      <SpaceBox height={10} />
      <div className={'cancel-button-container'}>
        <Button
          onClick={() => {
            logger.info('User saw withdraw success modal and closed');
            exit();
          }}
          className={'cancel-button'}
        >
          Confirm
        </Button>
      </div>
    </WithdrawInfoWrapper>
  );
};
