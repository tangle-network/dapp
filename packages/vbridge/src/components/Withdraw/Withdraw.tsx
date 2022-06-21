import { FormHelperText, InputBase, Typography } from '@material-ui/core';
import {
  chainTypeIdToInternalId,
  getChainNameFromChainId,
  parseChainIdType,
  WalletConfig,
  WebbRelayer,
  WithdrawState,
} from '@webb-dapp/api-providers';
import { chainsPopulated } from '@webb-dapp/apps/configs';
import { useDepositNotes } from '@webb-dapp/mixer';
import { RelayerModal } from '@webb-dapp/react-components/Relayer/RelayerModal';
import { WithdrawSuccessModal } from '@webb-dapp/react-components/Withdraw';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { AmountInput } from '@webb-dapp/ui-components/Inputs/AmountInput/AmountInput';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { BridgeNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/BridgeNoteInput';
import { RelayerButton } from '@webb-dapp/ui-components/Inputs/RelayerButton/RelayerButton';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import WithdrawingModal from '@webb-dapp/vbridge/components/Withdraw/WithdrawingModal';
import { useWithdraw } from '@webb-dapp/vbridge/hooks/withdraw/useWithdraw';
import { Note } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const WithdrawWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  ${({ theme, wallet }) => {
    if (wallet) {
      return css``;
    } else {
      return css`
        padding: 25px 35px;
        background: ${theme.layer2Background};
        border: 1px solid ${theme.borderColor};
        border-radius: 0 0 13px 13px;
      `;
    }
  }}
  background: ${({ theme }) => theme.lightSelectionBackground};
  border-radius: 10px;
`;

const WithdrawNoteSection = styled.div`
  padding: 25px 35px;
  background: ${({ theme }) => theme.layer1Background};

  .note-input {
    display: flex;
    ${({ theme }: { theme: Pallet }) => css`
      border: 1px solid ${theme.heavySelectionBorderColor};
      color: ${theme.primaryText};
      background: ${theme.heavySelectionBackground};
    `}
    height: 50px;
    border-radius: 10px;
    padding: 5px;
  }
`;

const AddressAndInfoSection = styled.div`
  background: ${({ theme }) => theme.layer2Background};
  border-radius: 13px;
  border: 1px solid ${({ theme }) => theme.borderColor};

  .address-input {
    display: flex;
    ${({ theme }: { theme: Pallet }) => css`
      border: 1px solid ${theme.heavySelectionBorderColor};
      color: ${theme.primaryText};
      background: ${theme.heavySelectionBackground};
    `}
    height: 50px;
    padding: 5px;
    margin: 0px 35px;
    border-radius: 10px;
  }

  .information-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 35px;

    .title {
      color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(255, 255, 255, 0.69)' : 'rgba(0, 0, 0, 0.69)')};
    }

    .value {
      color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
    }
  }

  .total-amount {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 35px;
    background: ${({ theme }) => theme.heavySelectionBackground};

    .title {
      color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(255, 255, 255, 0.69)' : 'rgba(0, 0, 0, 0.69)')};
    }

    .value {
      color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
    }
  }
`;

type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [notes, setNotes] = useState<string[]>([]);
  const [parsedAmount, setParsedAmount] = useState<number>(0);

  const [recipient, setRecipient] = useState('');
  const [showRelayerModal, setShowRelayerModal] = useState(false);
  const [fees, setFees] = useState('0');
  const { activeApi, activeChain, activeWallet, switchChain } = useWebContext();
  const depositNotes = useDepositNotes(notes);
  const depositInfo = useMemo(() => {
    if (!depositNotes) {
      return null;
    }
    const { note } = depositNotes[0];
    const amount = depositNotes.reduce((available, { note }) => available + Number(note.amount), 0);
    const sourceChainId = note.sourceChainId;
    const targetChainId = note.targetChainId;
    const tokenSymbol = note.tokenSymbol;
    return {
      note: depositNotes[0],
      amount,
      sourceChainId,
      targetChainId,
      tokenSymbol,
    };
  }, [depositNotes]);
  const {
    canCancel,
    cancelWithdraw,
    receipt,
    relayerMethods,
    relayersState,
    setReceipt,
    setRelayer,
    stage,
    validationErrors,
    withdraw,
  } = useWithdraw({
    amount: String(parsedAmount),
    note: depositNotes,
    recipient,
  });
  const appConfig = useAppConfig();

  const shouldSwitchChain = useMemo(() => {
    if (!depositInfo || !activeChain) {
      return false;
    }
    const chainId = parseChainIdType(Number(depositInfo.targetChainId)).chainId;

    return activeChain.chainId !== chainId;
  }, [activeChain, depositInfo]);

  const isDisabled = useMemo(() => {
    if (depositNotes && shouldSwitchChain) {
      return false;
    } else if (depositNotes && recipient && parsedAmount) {
      return false;
    }
    return true;
  }, [depositNotes, shouldSwitchChain, recipient, parsedAmount]);

  const switchChainFromNote = async (note: Note | null) => {
    if (!note) {
      return;
    }
    if (!activeApi || !activeWallet) {
      return;
    }
    const chainTypeId = parseChainIdType(Number(note.note.targetChainId));
    const internalChainId = chainTypeIdToInternalId(chainTypeId);
    const chain = chainsPopulated[internalChainId];
    await switchChain(chain, activeWallet);
  };

  // Side effect for fetching the relayer fees if applicable
  useEffect(() => {
    if (relayersState.activeRelayer && depositInfo) {
      relayersState.activeRelayer.fees(depositInfo.note.serialize()).then((feeInfo) => {
        if (feeInfo) {
          setFees(ethers.utils.formatUnits(feeInfo.totalFees, depositInfo.note.denomination));
        }
      });
    }
  }, [relayersState, depositInfo]);
  const [userAmountInput, setUserAmountInput] = useState<string>('');

  const parseAndSetAmount = (amount: string): void => {
    setUserAmountInput(amount);
    let parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setParsedAmount(parsedAmount);
    }
  };
  return (
    <WithdrawWrapper wallet={activeWallet}>
      <WithdrawNoteSection>
        <InputTitle
          leftLabel='ADD NOTE'
          rightLabel={
            <RelayerButton
              disabled={!activeChain}
              onClick={() => {
                setShowRelayerModal(true);
              }}
            />
          }
        />
        <div className='note-input'>
          <BridgeNoteInput
            error={depositNotes ? validationErrors.note : ''}
            value={notes[0] || ''}
            onChange={(note) => {
              setNotes([note]);
            }}
          />
        </div>
      </WithdrawNoteSection>
      {depositInfo && (
        <AddressAndInfoSection>
          <div style={{ padding: '10px 35px' }}>
            <Typography variant={'h6'}>
              <b>RECIPIENT ADDRESS</b>
            </Typography>
          </div>
          <div className='address-input'>
            <InputBase
              value={recipient}
              onChange={(event) => {
                setRecipient(event.target.value as string);
              }}
              inputProps={{ style: { fontSize: 14 } }}
              fullWidth
              placeholder={`Please paste your address here`}
            />
            <FormHelperText error={Boolean(validationErrors.recipient && recipient)}>
              {validationErrors.recipient}
            </FormHelperText>
          </div>
          <div style={{ padding: '10px 35px' }}>
            <Typography variant={'h6'}>
              <b>WITHDRAW AMOUNT</b>
            </Typography>
          </div>
          <div className='address-input'>
            <AmountInput error={''} onChange={parseAndSetAmount} value={userAmountInput} />
          </div>
          <SpaceBox height={16} />
          <div className='information-item'>
            <p className='title'>Deposit Amount</p>
            <p className='value'>
              {depositInfo.amount} {depositInfo.tokenSymbol}
            </p>
          </div>
          <div className='information-item'>
            <p className='title'>Chains</p>
            <p className='value'>
              {getChainNameFromChainId(appConfig, parseChainIdType(Number(depositInfo.sourceChainId)))}
              {` -> `}
              {getChainNameFromChainId(appConfig, parseChainIdType(Number(depositInfo.targetChainId)))}
            </p>
          </div>
          <div className='information-item'>
            <p className='title'>Relayer Fee</p>
            <p className='value'>
              {fees} {depositInfo.tokenSymbol}
            </p>
          </div>
          <SpaceBox height={4} />
          <div className='total-amount'>
            <p className='title'>Total Amount</p>
            <p className='value'>
              {Number(parsedAmount) - Number(fees)} {depositInfo.tokenSymbol}
            </p>
          </div>
          <SpaceBox height={8} />
          <div style={{ padding: '10px 35px' }}>
            <MixerButton
              disabled={isDisabled}
              onClick={async () => {
                if (shouldSwitchChain) {
                  return switchChainFromNote(depositInfo.note);
                }
                await withdraw();
              }}
              label={shouldSwitchChain ? 'Switch chains to withdraw' : 'Withdraw'}
            />
          </div>
          <SpaceBox height={16} />
        </AddressAndInfoSection>
      )}
      <Modal open={stage !== WithdrawState.Ideal}>
        {depositNotes && (
          <WithdrawingModal
            withdrawTxInfo={{
              account: recipient,
            }}
            note={depositInfo?.note.note}
            cancel={cancelWithdraw}
            stage={stage}
            canCancel={canCancel}
          />
        )}
      </Modal>

      {/* Modal to show on success  */}
      <Modal open={receipt != ''}>
        {depositNotes && (
          <WithdrawSuccessModal
            receipt={receipt}
            recipient={recipient}
            note={depositNotes?.[0]}
            relayer={relayersState.activeRelayer}
            exit={() => {
              setNotes([]);
              setRecipient('');
              setReceipt('');
              return cancelWithdraw();
            }}
          />
        )}
      </Modal>

      {/* Modal to show for relayer settings */}
      <Modal open={showRelayerModal}>
        <RelayerModal
          note={depositNotes?.[0]}
          state={relayersState}
          methods={relayerMethods}
          onChange={(nextRelayer: WebbRelayer | null) => {
            setRelayer(nextRelayer);
          }}
          onClose={() => {
            setShowRelayerModal(false);
          }}
        />
      </Modal>
    </WithdrawWrapper>
  );
};
