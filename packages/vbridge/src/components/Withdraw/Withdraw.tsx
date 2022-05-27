import { FormHelperText, InputBase, Typography } from '@material-ui/core';
import { chainsPopulated } from '@webb-dapp/apps/configs';
import { useDepositNote } from '@webb-dapp/mixer';
import { RelayerModal } from '@webb-dapp/react-components/Relayer/RelayerModal';
import { WithdrawingModal, WithdrawSuccessModal } from '@webb-dapp/react-components/Withdraw';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components';
import { SettingsIcon } from '@webb-dapp/ui-components/assets/SettingsIcon';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { BridgeNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/BridgeNoteInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { useWithdraw } from '@webb-dapp/vbridge/hooks/withdraw/useWithdraw';
import {
  chainTypeIdToInternalId,
  getChainNameFromChainId,
  parseChainIdType,
  WalletConfig,
  WebbRelayer,
  WithdrawState,
} from '@webb-tools/api-providers';
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

  .titles-and-information {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const RelayerSettings = styled.div`
  box-sizing: border-box;

  .wallet-logo-wrapper {
    width: 20px;
    height: 20px;
    background: transparent;
  }

  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  height: 45px;
  border-radius: 12px;
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
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState('');
  const [showRelayerModal, setShowRelayerModal] = useState(false);
  const [fees, setFees] = useState('0');
  const { activeApi, activeChain, activeWallet, switchChain } = useWebContext();
  const depositNote = useDepositNote(note);

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
    recipient,
    note: depositNote,
  });
  const appConfig = useAppConfig();

  const shouldSwitchChain = useMemo(() => {
    if (!depositNote || !activeChain) {
      return false;
    }
    const chainId = parseChainIdType(Number(depositNote.note.targetChainId)).chainId;

    return activeChain.chainId !== chainId;
  }, [activeChain, depositNote]);

  const isDisabled = useMemo(() => {
    if (depositNote && shouldSwitchChain) {
      return false;
    } else if (depositNote && recipient) {
      return false;
    }
    return true;
  }, [depositNote, shouldSwitchChain, recipient]);

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
    if (relayersState.activeRelayer && depositNote) {
      relayersState.activeRelayer.fees(depositNote.note.serialize()).then((feeInfo) => {
        if (feeInfo) {
          setFees(ethers.utils.formatUnits(feeInfo.totalFees, depositNote.note.denomination));
        }
      });
    }
  }, [relayersState, depositNote]);

  return (
    <WithdrawWrapper wallet={activeWallet}>
      <WithdrawNoteSection>
        <div className='titles-and-information'>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant={'h6'}>
              <b>ADD NOTE</b>
            </Typography>
          </div>
          <RelayerSettings
            role='button'
            aria-disabled={!activeChain}
            onClick={() => {
              setShowRelayerModal(true);
            }}
            className='select-button'
          >
            <SettingsIcon />
            <p style={{ fontSize: '14px', color: '#B6B6B6', marginLeft: '5px' }}>RELAYER</p>
          </RelayerSettings>
        </div>
        <div className='note-input'>
          <BridgeNoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />
        </div>
      </WithdrawNoteSection>
      {depositNote && (
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
          <SpaceBox height={16} />
          <div className='information-item'>
            <p className='title'>Deposit Amount</p>
            <p className='value'>
              {depositNote.note.amount} {depositNote.note.tokenSymbol}
            </p>
          </div>
          <div className='information-item'>
            <p className='title'>Chains</p>
            <p className='value'>
              {getChainNameFromChainId(appConfig, parseChainIdType(Number(depositNote.note.sourceChainId)))}
              {` -> `}
              {getChainNameFromChainId(appConfig, parseChainIdType(Number(depositNote.note.targetChainId)))}
            </p>
          </div>
          <div className='information-item'>
            <p className='title'>Relayer Fee</p>
            <p className='value'>
              {fees} {depositNote.note.tokenSymbol}
            </p>
          </div>
          <SpaceBox height={4} />
          <div className='total-amount'>
            <p className='title'>Total Amount</p>
            <p className='value'>
              {Number(depositNote.note.amount) - Number(fees)} {depositNote.note.tokenSymbol}
            </p>
          </div>
          <SpaceBox height={8} />
          <div style={{ padding: '10px 35px' }}>
            <MixerButton
              disabled={isDisabled}
              onClick={() => {
                if (shouldSwitchChain) {
                  return switchChainFromNote(depositNote);
                }
                withdraw();
              }}
              label={shouldSwitchChain ? 'Switch chains to withdraw' : 'Withdraw'}
            />
          </div>
          <SpaceBox height={16} />
        </AddressAndInfoSection>
      )}
      <Modal open={stage !== WithdrawState.Ideal}>
        {depositNote && (
          <WithdrawingModal
            withdrawTxInfo={{
              account: recipient,
            }}
            note={depositNote.note}
            cancel={cancelWithdraw}
            stage={stage}
            canCancel={canCancel}
          />
        )}
      </Modal>

      {/* Modal to show on success  */}
      <Modal open={receipt != ''}>
        {depositNote && (
          <WithdrawSuccessModal
            receipt={receipt}
            recipient={recipient}
            note={depositNote.note}
            relayer={relayersState.activeRelayer}
            exit={() => {
              setNote('');
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
          note={depositNote}
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
