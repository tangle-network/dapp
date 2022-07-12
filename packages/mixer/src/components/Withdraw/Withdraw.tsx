import { FormHelperText, InputBase, Typography } from '@mui/material';
import { TransactionState, WalletConfig, WebbRelayer } from '@webb-dapp/api-providers';
import { chainsPopulated, currenciesConfig } from '@webb-dapp/apps/configs';
import { useWithdraw } from '@webb-dapp/mixer/hooks';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
import { RelayerModal } from '@webb-dapp/react-components/Relayer/RelayerModal';
import { WithdrawingModal, WithdrawSuccessModal } from '@webb-dapp/react-components/Withdraw';
import { useWebContext } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { MixerNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/MixerNoteInput';
import { RelayerButton } from '@webb-dapp/ui-components/Inputs/RelayerButton/RelayerButton';
import { TextLabel } from '@webb-dapp/ui-components/Inputs/TextLabel/TextLabel';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { Note } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const WithdrawWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  background: ${({ theme }) => theme.layer1Background};
  border-radius: 16px;

  .titles-and-information {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const WithdrawNoteSection = styled.div`
  padding: 25px 35px;

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
  const depositNote = useDepositNote(note);

  const [recipient, setRecipient] = useState('');
  const [showRelayerModal, setShowRelayerModal] = useState(false);
  const [fees, setFees] = useState('0');
  const { activeApi, activeWallet } = useWebContext();

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

  const disabledButton = useMemo(() => {
    return !(depositNote && recipient);
  }, [recipient, depositNote]);
  const determineSwitchButton = () => {
    return false;
  };
  const switchChain = async (note: Note | null) => {
    if (!note) {
      return;
    }
    if (!activeApi) {
      return;
    }
    const newChainId = Number(note?.note.targetChainId);
    const chain = chainsPopulated[newChainId];

    const web3Provider = activeApi.getProvider();
    if (!web3Provider) {
      return;
    }
    await web3Provider
      .switchChain({
        chainId: `0x${chain.chainId?.toString(16)}`,
      })
      ?.catch(async (switchError: any) => {
        console.log('SwitchError: ', switchError);

        // cannot switch because network not recognized, so prompt to add it
        if (switchError.code === 4902) {
          const currency = currenciesConfig[chain.nativeCurrencyId];
          await web3Provider.addChain({
            chainId: `0x${chain.chainId?.toString(16)}`,
            chainName: chain.name,
            rpcUrls: chain.evmRpcUrls,
            nativeCurrency: {
              decimals: 18,
              name: currency.name,
              symbol: currency.symbol,
            },
          });
          // add network will prompt the switch, check evmId again and throw if user rejected
          const newChainId = await web3Provider.network;

          if (newChainId != chain.chainId) {
            throw switchError;
          }
        } else {
          throw switchError;
        }
      });
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
        <InputTitle
          leftLabel={<TextLabel value='ADD NOTE' />}
          rightLabel={<RelayerButton onClick={() => setShowRelayerModal(true)} />}
        />
        <div className='note-input'>
          <MixerNoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />
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
              {ethers.utils.formatUnits(depositNote.note.amount, depositNote.note.denomination)}{' '}
              {depositNote.note.tokenSymbol}
            </p>
          </div>
          <div className='information-item'>
            <p className='title'>Relayer Fee</p>
            <p className='value'>
              {Number(fees)} {depositNote.note.tokenSymbol}
            </p>
          </div>
          <SpaceBox height={4} />
          <div className='total-amount'>
            <p className='title'>Total Amount</p>
            <p className='value'>
              {Number(ethers.utils.formatUnits(depositNote.note.amount, depositNote.note.denomination)) - Number(fees)}{' '}
              {depositNote.note.tokenSymbol}
            </p>
          </div>
          <SpaceBox height={8} />
          <div style={{ padding: '10px 35px' }}>
            <MixerButton
              disabled={disabledButton}
              onClick={determineSwitchButton() ? () => switchChain(depositNote) : withdraw}
              label={determineSwitchButton() ? 'Switch chains to withdraw' : 'Withdraw'}
            />
          </div>
          <SpaceBox height={16} />
        </AddressAndInfoSection>
      )}

      {/* Modal to show while in progress */}
      <Modal open={stage !== TransactionState.Ideal}>
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
            inputNote={depositNote.note}
            relayer={relayersState.activeRelayer}
            exit={() => {
              setNote('');
              setRecipient('');
              setReceipt('');
              /// will reset the tx handler
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
