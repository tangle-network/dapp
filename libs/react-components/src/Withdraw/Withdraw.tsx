import { InputBase, Typography } from '@mui/material';
import { TransactionState, WebbRelayer } from '@nepoche/abstract-api-provider';
import { chainsPopulated, WalletConfig } from '@nepoche/dapp-config';
import { ChainNotesSwitcher } from '@nepoche/react-components/ChainNotesSwitcher/ChainNotesSwitcher';
import { NoteInput } from '@nepoche/react-components/NoteInput';
import { TransactionProcessingModal } from '@nepoche/react-components/Transact/TransactionProcessingModal';
import { WithdrawSuccessModal } from '@nepoche/react-components/Withdraw';
import { useApiConfig, useWebContext } from '@nepoche/api-provider-environment';
import { useDepositNotes } from '@nepoche/react-hooks/note';
import { useWithdraw } from '@nepoche/react-hooks/withdraw/useWithdraw';
import { getRelayerManagerFactory } from '@nepoche/relayer-manager-factory';
import { InformationItem, Title, Value } from '@nepoche/ui-components';
import { AlertCard } from '@nepoche/ui-components/AlertCard';
import { MixerButton } from '@nepoche/ui-components/Buttons/MixerButton';
import { InputTitle } from '@nepoche/ui-components/Inputs/InputTitle/InputTitle';
import { RelayerApiAdapter, RelayerInput } from '@nepoche/react-components/RelayerInput/RelayerInput';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import { Pallet } from '@nepoche/styled-components-theme';
import { above } from '@nepoche/responsive-utils';
import { calculateTypedChainId, FixedPointNumber, Note, parseTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const WithdrawWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  border-radius: 8px;
  background: ${({ theme }) => theme.layer1Background};

  ${above.xs(css`
    border-radius: 16px;
  `)}
`;

const WithdrawNoteSection = styled.div`
  padding: 0px 6px 12px 12px;

  ${above.xs(css`
    padding: 0px 24px 24px 12px;
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
`;

const InputWrapper = styled.div`
  :not(:last-child) {
    margin-bottom: 12px;
  }

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

const SummaryContainer = styled.div`
  ${sharedCss}

  background: ${({ theme }) => theme.heavySelectionBackground};
`;

const ButtonContainer = styled.div`
  ${sharedCss}
`;

export const Withdraw: React.FC = () => {
  const [manualNoteSelection, setManualNoteSelection] = useState(false);
  const [noteStrings, setNoteStrings] = useState<string[]>(['']);
  const [recipient, setRecipient] = useState('');
  const [fees, setFees] = useState('0');
  const [userAmountInput, setUserAmountInput] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [formError, setFormError] = useState<null | string>(null);
  const [validInput, setValidInput] = useState(false);

  const { activeApi, activeChain, activeWallet, noteManager, switchChain } = useWebContext();
  const manualNotes = useDepositNotes(noteStrings);
  const apiConfig = useApiConfig();
  const depositNotes = useMemo<Note[] | null>(() => {
    const notes =
      noteManager && activeChain && activeApi
        ? noteManager
            .getAllNotes()
            .get(calculateTypedChainId(activeChain.chainType, activeChain.chainId).toString())
            ?.filter((note) => note.note.tokenSymbol === activeApi.state.activeBridge?.currency.view.symbol) ?? null
        : manualNotes;

    return notes;
  }, [noteManager, activeChain, activeApi, manualNotes]);

  const { cancelWithdraw, outputNotes, receipt, relayersState, setOutputNotes, setRelayer, stage, withdraw } =
    useWithdraw({
      recipient,
      notes: depositNotes,
      amount: withdrawAmount,
    });

  const firstNote = useMemo<Note | null>(() => (!depositNotes?.length ? null : depositNotes[0]), [depositNotes]);

  const shouldSwitchChain = useMemo(() => {
    if (!depositNotes?.length || !activeChain) {
      return false;
    }

    // Dest chain is the first chain in the list
    const chainId = parseTypedChainId(Number(depositNotes[0].note.targetChainId)).chainId;
    return activeChain.chainId !== chainId;
  }, [activeChain, depositNotes]);

  const switchChainFromNote = async (note: Note | null) => {
    if (!note) {
      return;
    }
    if (!activeApi || !activeWallet) {
      return;
    }
    const chain = chainsPopulated[Number(note.note.targetChainId)];
    await switchChain(chain, activeWallet);
  };

  const relayerApi: RelayerApiAdapter = useMemo(() => {
    return {
      getInfo: async (endpoint) => {
        const relayerManagerFactory = await getRelayerManagerFactory();
        return relayerManagerFactory.fetchCapabilities(endpoint) ?? ({} as any);
      },
      add: async (endPoint: string) => {
        const relayerManagerFactory = await getRelayerManagerFactory();
        const relayerCapabilities = await relayerManagerFactory.addRelayer(endPoint);
        const relayer = new WebbRelayer(endPoint, relayerCapabilities[endPoint]);
        activeApi?.relayerManager.addRelayer(relayer);
        return relayer;
      },
    };
  }, [activeApi]);

  const depositAmount = useMemo(() => {
    if (!depositNotes?.length || !firstNote) {
      return 0;
    }

    return depositNotes.reduce((acc, currentNote) => {
      const isMatchDestChain = currentNote.note.targetChainId === firstNote.note.targetChainId;
      const isMatchTokenSymbol = currentNote.note.tokenSymbol === firstNote.note.tokenSymbol;
      const isMatchProtocol = currentNote.note.protocol === 'vanchor';

      return isMatchDestChain && isMatchTokenSymbol && isMatchProtocol
        ? acc + Number(ethers.utils.formatUnits(currentNote.note.amount, currentNote.note.denomination))
        : acc;
    }, 0);
  }, [depositNotes, firstNote]);

  const parseAndSetAmount = (amount: string): void => {
    setUserAmountInput(amount);
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setWithdrawAmount(parsedAmount);
    }
  };

  const isDisabled = useMemo(() => {
    if (withdrawAmount > depositAmount || !withdrawAmount || !!formError) {
      return true;
    }

    if (depositNotes?.length && shouldSwitchChain) {
      return false;
    }

    if (depositNotes?.length && recipient) {
      return false;
    }

    return true;
  }, [withdrawAmount, depositAmount, formError, depositNotes?.length, shouldSwitchChain, recipient]);

  const addNewNoteInput = useCallback(() => {
    setNoteStrings((prevNotes) => {
      const newNotes = prevNotes.slice();
      newNotes.push('');
      return newNotes;
    });
  }, []);

  const removeNoteInput = useCallback((idx: number) => {
    setNoteStrings((prevNotes) => {
      if (idx < 0 || idx >= prevNotes.length) {
        throw new Error('Note index out of bound');
      }
      const newNotes = prevNotes.slice();
      newNotes.splice(idx, 1);
      return newNotes;
    });
  }, []);

  // Side effect for validating form inputs
  useEffect(() => {
    const validateFormInput = () => {
      const set = new Set(noteStrings);

      if (set.size !== noteStrings.length) {
        return setFormError('All notes must have different values');
      }

      if (withdrawAmount > depositAmount) {
        return setFormError('Not enough funds');
      }

      setFormError(null);
    };

    validateFormInput();
  }, [depositAmount, noteStrings, withdrawAmount]);

  // Side effect for fetching the relayer fees if applicable
  useEffect(() => {
    let isSubscribe = true;

    const fetchRelayerFees = async () => {
      const activeRelayer = relayersState.activeRelayer;
      if (!activeRelayer || !depositNotes?.length || !firstNote) {
        return;
      }

      try {
        const innerNote = firstNote.note;
        const matchedNotes = depositNotes.filter(
          ({ note }) => note.targetChainId === innerNote.targetChainId && note.tokenSymbol === innerNote.tokenSymbol
        );

        const feesInfoArr = await Promise.all(
          matchedNotes.map(async ({ note }) => activeRelayer.fees(note.serialize()))
        );

        const fee = feesInfoArr.reduce((acc, currentFeeInfo, idx) => {
          if (!currentFeeInfo) {
            return acc;
          }

          const formattedFee = ethers.utils.formatUnits(currentFeeInfo.totalFees, matchedNotes[idx].note.denomination);

          return acc.plus(FixedPointNumber.fromInner(formattedFee));
        }, FixedPointNumber.fromInner(0));

        if (isSubscribe) {
          setFees(fee.toString());
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchRelayerFees();

    return () => {
      isSubscribe = false;
    };
  }, [relayersState, depositNotes, firstNote]);

  // Side effect for displaying appropriate components based on noteManager selection
  useEffect(() => {
    if (!noteManager && manualNoteSelection === false) {
      setManualNoteSelection(true);
    } else if (noteManager && manualNoteSelection === true) {
      setManualNoteSelection(false);
    }

    if (manualNoteSelection && firstNote) {
      setValidInput(true);
    }
  }, [noteManager, manualNoteSelection, firstNote]);

  return (
    <WithdrawWrapper wallet={activeWallet}>
      {manualNoteSelection && (
        <>
          <InputsContainer style={{ paddingBottom: '0px' }}>
            <InputTitle leftLabel='Add Note(s)' />
          </InputsContainer>
          <WithdrawNoteSection>
            {noteStrings.map((note, idx) => (
              <NoteInput
                noteAction={idx === noteStrings.length - 1 ? () => addNewNoteInput() : () => removeNoteInput(idx)}
                isRemoveNote={idx !== noteStrings.length - 1}
                key={idx}
                note={note}
                setNote={(nextNote) => {
                  const newNotes = noteStrings.slice();
                  newNotes[idx] = nextNote;
                  setNoteStrings(newNotes);
                }}
              />
            ))}
          </WithdrawNoteSection>
        </>
      )}
      {!manualNoteSelection && (
        <>
          <ChainNotesSwitcher setValidInput={setValidInput} protocol='vanchor' />
          {!validInput && (
            <>
              <AddressAndInfoSection>
                <InputsContainer>
                  <Typography>No notes found for the selected protocol, chain, and currency pairing.</Typography>
                  <br />
                  <Typography>
                    Select a different combination, or load notes into your note account to withdraw.
                  </Typography>
                </InputsContainer>
              </AddressAndInfoSection>
            </>
          )}
        </>
      )}

      {validInput && firstNote && (
        <AddressAndInfoSection>
          <InputsContainer>
            <InputWrapper>
              <InputTitle leftLabel='Withdraw Amount' />
              <div className='address-input'>
                <InputBase
                  value={userAmountInput}
                  onChange={(event) => {
                    parseAndSetAmount(event.target.value);
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
            <AlertCard
              hasIcon
              variant='info'
              text='If you use multiple notes with different dest chains or different tokens, we will use info of the first note.'
            />

            <InformationItem>
              <Title>Available Amount</Title>
              <Value>
                {depositAmount} {firstNote.note.tokenSymbol}
              </Value>
            </InformationItem>

            <InformationItem>
              <Title>Chains</Title>
              <Value>
                {apiConfig.getChainNameFromTypedChainId(parseTypedChainId(Number(firstNote.note.sourceChainId)))}
                {` -> `}
                {apiConfig.getChainNameFromTypedChainId(parseTypedChainId(Number(firstNote.note.targetChainId)))}
              </Value>
            </InformationItem>

            <InformationItem>
              <Title>Relayer Fee</Title>
              <Value>
                {fees} {firstNote.note.tokenSymbol}
              </Value>
            </InformationItem>

            <InformationItem>
              <Title>Total amount</Title>
              <Value>
                {withdrawAmount - Number(fees)} {firstNote.note.tokenSymbol}
              </Value>
            </InformationItem>
          </SummaryContainer>

          <ButtonContainer>
            {formError && <AlertCard variant='error' hasIcon text={formError} />}
            <MixerButton
              disabled={isDisabled}
              onClick={() => {
                if (shouldSwitchChain && firstNote) {
                  return switchChainFromNote(firstNote);
                }
                withdraw();
              }}
              label={
                shouldSwitchChain
                  ? 'Switch chains to withdraw'
                  : withdrawAmount > depositAmount
                  ? 'Not enough funds'
                  : 'Withdraw'
              }
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
            sourceChain={apiConfig.getChainNameFromTypedChainId(
              parseTypedChainId(Number(depositNotes[0].note.sourceChainId))
            )}
            destChain={apiConfig.getChainNameFromTypedChainId(
              parseTypedChainId(Number(depositNotes[0].note.targetChainId))
            )}
            cancel={cancelWithdraw}
            hide={() => console.log("can't hide withdrawing modal")}
          />
        )}
      </Modal>

      {/* Modal to show on success  */}
      <Modal open={outputNotes.length > 0}>
        {outputNotes.length && depositNotes && (
          <WithdrawSuccessModal
            receipt={receipt}
            recipient={recipient}
            changeNote={outputNotes[0].note}
            inputNote={depositNotes[0].note}
            amount={withdrawAmount}
            relayer={relayersState.activeRelayer}
            exit={() => {
              setNoteStrings(['']);
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
