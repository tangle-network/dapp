import { FormHelperText, Icon, IconButton, InputBase } from '@material-ui/core';
import {
  ActiveWebbRelayer,
  chainTypeIdToInternalId,
  getChainNameFromChainId,
  parseChainIdType,
  TransactionState,
  WalletConfig,
  WebbRelayer,
} from '@webb-dapp/api-providers';
import { chainsPopulated } from '@webb-dapp/apps/configs';
import { getRelayerManagerFactory } from '@webb-dapp/apps/configs/relayer-config';
import { useDepositNote, useDepositNotes } from '@webb-dapp/mixer';
import { TransactionProcessingModal } from '@webb-dapp/react-components/Transact/TransactionProcessingModal';
import { WithdrawSuccessModal } from '@webb-dapp/react-components/Withdraw';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { BridgeNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/BridgeNoteInput';
import { FeesInfo, RelayerApiAdapter, RelayerInput } from '@webb-dapp/ui-components/Inputs/RelayerInput/RelayerInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Alert } from '@webb-dapp/ui-components/notification/Notification';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above, useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
import { useWithdraw, useWithdraws } from '@webb-dapp/vbridge';
import { Note } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { NoteInput } from '../NoteInput';
import { InformationItem, Title, Value } from '../shared/styled';

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
  background: ${({ theme }) => theme.layer1Background};
  border-radius: 10px;
`;

const WithdrawNoteSection = styled.div`
  padding: 12px 6px;

  ${above.xs(css`
    padding: 24px 12px;
    padding-right: 24px;
  `)}
`;

const AddressAndInfoSection = styled.div`
  background: ${({ theme }) => theme.layer2Background};
  border-radius: 13px;
  border: 1px solid ${({ theme }) => theme.borderColor};
`;

const sharedCss = css`
  padding: 12px 14px;

  ${above.xs`
    padding: 24px 35px;
  `}
`;

const InputsContainer = styled.div`
  ${sharedCss}

  .address-input {
    display: flex;
    ${({ theme }: { theme: Pallet }) => css`
      border: 1px solid ${theme.heavySelectionBorderColor};
      color: ${theme.primaryText};
      background: ${theme.heavySelectionBackground};
    `}
    height: 50px;
    padding: 0 12px;
    border-radius: 10px;
  }
`;

const InputWrapper = styled.div`
  :not(:last-child) {
    margin-bottom: 12px;
  }
`;

const SummaryContainer = styled.div`
  ${sharedCss}

  background: ${({ theme }) => theme.heavySelectionBackground};
`;

const ButtonContainer = styled.div`
  ${sharedCss}
`;

type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [notes, setNotes] = useState<string[]>(['']);
  const [recipient, setRecipient] = useState('');
  const [fees, setFees] = useState('0');
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const { activeApi, activeChain, activeWallet, switchChain } = useWebContext();
  const config = useAppConfig();
  const depositNotes = useDepositNotes(notes);

  const {
    canCancel,
    cancelWithdraw,
    outputNotes,
    receipt,
    relayerMethods,
    relayersState,
    setOutputNotes,
    setRelayer,
    stage,
    validationError,
    withdraw,
  } = useWithdraws({
    recipient,
    notes: depositNotes,
    amount: withdrawAmount,
  });

  const appConfig = useAppConfig();

  const shouldSwitchChain = useMemo(() => {
    if (!depositNotes?.length || !activeChain) {
      return false;
    }

    const chainIds = depositNotes.map(
      (depositNote) => parseChainIdType(Number(depositNote.note.targetChainId)).chainId
    );

    return !chainIds.includes(activeChain.chainId);
  }, [activeChain, depositNotes]);

  const isDisabled = useMemo(() => {
    if (depositNotes?.length && shouldSwitchChain) {
      return false;
    } else if (depositNotes?.length && recipient) {
      return false;
    }
    return true;
  }, [depositNotes, shouldSwitchChain, recipient]);

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

  const relayerApi: RelayerApiAdapter = useMemo(() => {
    return {
      getInfo: async (endpoint) => {
        const relayerManagerFactory = await getRelayerManagerFactory(config);
        return relayerManagerFactory.fetchCapabilities(endpoint) ?? ({} as any);
      },
      add: async (endPoint: string, _persistent: boolean) => {
        const relayerManagerFactory = await getRelayerManagerFactory(config);
        const relayerCapabilities = await relayerManagerFactory.addRelayer(endPoint);
        const relayer = new WebbRelayer(endPoint, relayerCapabilities[endPoint]);
        activeApi?.relayerManager.addRelayer(relayer);
      },
    };
  }, [config, activeApi]);

  const depositAmount = useMemo(() => {
    return depositNotes?.reduce((pre, acc) => Number(acc.note.amount) + pre, 0) ?? 0;
  }, [depositNotes]);

  const addNewNoteInput = useCallback(() => {
    setNotes((prevNotes) => {
      const newNotes = prevNotes.slice();
      newNotes.push('');
      return newNotes;
    });
  }, []);

  const removeNoteInput = useCallback((idx: number) => {
    setNotes((prevNotes) => {
      if (idx < 0 || idx >= prevNotes.length) {
        throw new Error('Note index out of bound');
      }
      const newNotes = prevNotes.slice();
      newNotes.splice(idx, 1);
      return newNotes;
    });
  }, []);

  // Side effect for fetching the relayer fees if applicable
  useEffect(() => {
    const fetchRelayerFees = async () => {
      const activeRelayer = relayersState.activeRelayer;
      if (!activeRelayer || !depositNotes?.length) {
        return;
      }

      try {
        const feesInfo = await Promise.all(
          depositNotes.map(async (depositNote) => activeRelayer.fees(depositNote.note.serialize()))
        );
      } catch (error) {
        console.log(error);
      }
    };
  }, [relayersState, depositNotes]);

  return (
    <WithdrawWrapper wallet={activeWallet}>
      <WithdrawNoteSection>
        {notes.map((note, idx) => (
          <NoteInput
            noteAction={idx === notes.length - 1 ? () => addNewNoteInput() : () => removeNoteInput(idx)}
            isRemoveNote={idx !== notes.length - 1}
            key={idx}
            note={note}
            setNote={(nextNote) => {
              const newNotes = notes.slice();
              newNotes[idx] = nextNote;
              setNotes(newNotes);
            }}
          />
        ))}
      </WithdrawNoteSection>

      {depositNotes?.length && (
        <AddressAndInfoSection>
          <InputsContainer>
            <InputWrapper>
              <InputTitle leftLabel='Withdraw Amount' />
              <div className='address-input'>
                <InputBase
                  value={withdrawAmount}
                  onChange={(event) => {
                    const amount = Number(event.target.value);
                    setWithdrawAmount(amount);
                  }}
                  inputProps={{ style: { fontSize: 14 } }}
                  fullWidth
                  placeholder={`Amount`}
                />
              </div>
            </InputWrapper>

            <InputWrapper>
              <InputTitle leftLabel='Recipient Address' />
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
              </div>
            </InputWrapper>

            <InputWrapper>
              <InputTitle leftLabel='Relayer Selection' />
              <RelayerInput
                relayers={relayersState.relayers}
                activeRelayer={relayersState.activeRelayer}
                relayerApi={relayerApi}
                setActiveRelayer={(nextRelayer: WebbRelayer | null) => {
                  setRelayer(nextRelayer);
                }}
                tokenSymbol={''}
                wrapperStyles={{ width: '100%' }}
                showSummary={false}
              />
            </InputWrapper>
          </InputsContainer>
          <SummaryContainer>
            <InformationItem>
              <Title>Deposit Amount</Title>
              <Value>{depositAmount}</Value>
            </InformationItem>
            <InformationItem>
              <Title>Relayer Fee</Title>
              <Value>{fees}</Value>
            </InformationItem>
            <InformationItem>
              <Title>Total amount</Title>
              <Value>{depositAmount - Number(fees)}</Value>
            </InformationItem>
          </SummaryContainer>
          <ButtonContainer>
            <MixerButton
              disabled={isDisabled}
              onClick={() => {
                if (shouldSwitchChain && depositNotes?.length) {
                  /** TODO: Figure out how to switch chain */
                  return switchChainFromNote(depositNotes[0]);
                }
                withdraw();
              }}
              label={shouldSwitchChain ? 'Switch chains to withdraw' : 'Withdraw'}
            />
          </ButtonContainer>
        </AddressAndInfoSection>
      )}

      <Modal open={stage !== TransactionState.Ideal}>
        {depositNotes?.length && (
          <TransactionProcessingModal
            state={stage}
            txFlow={'Withdraw'}
            amount={withdrawAmount}
            sourceChain={getChainNameFromChainId(
              appConfig,
              parseChainIdType(Number(depositNotes[0].note.sourceChainId))
            )}
            destChain={getChainNameFromChainId(appConfig, parseChainIdType(Number(depositNotes[0].note.targetChainId)))}
            cancel={cancelWithdraw}
            hide={() => console.log("can't hide withdrawing modal")}
          />
        )}
      </Modal>

      {/* Modal to show on success  */}
      <Modal open={outputNotes.length > 0}>
        {depositNotes && (
          <WithdrawSuccessModal
            receipt={receipt}
            recipient={recipient}
            note={depositNotes[0].note}
            relayer={relayersState.activeRelayer}
            exit={() => {
              setNotes(['']);
              setRecipient('');
              setOutputNotes([]);
              return cancelWithdraw();
            }}
          />
        )}
      </Modal>
    </WithdrawWrapper>
  );
};
