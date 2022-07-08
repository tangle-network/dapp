import { InputBase } from '@material-ui/core';
import {
  chainTypeIdToInternalId,
  getChainNameFromChainId,
  parseChainIdType,
  TransactionState,
  WalletConfig,
  WebbRelayer,
} from '@webb-dapp/api-providers';
import { chainsPopulated } from '@webb-dapp/apps/configs';
import { getRelayerManagerFactory } from '@webb-dapp/apps/configs/relayer-config';
import { useDepositNotes } from '@webb-dapp/mixer';
import { TransactionProcessingModal } from '@webb-dapp/react-components/Transact/TransactionProcessingModal';
import { WithdrawSuccessModal } from '@webb-dapp/react-components/Withdraw';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment';
import { AlertCard } from '@webb-dapp/ui-components/AlertCard';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { RelayerApiAdapter, RelayerInput } from '@webb-dapp/ui-components/Inputs/RelayerInput/RelayerInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { useWithdraw } from '@webb-dapp/vbridge';
import { FixedPointNumber, Note } from '@webb-tools/sdk-core';
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

type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [notes, setNotes] = useState<string[]>(['']);
  const [recipient, setRecipient] = useState('');
  const [fees, setFees] = useState('0');
  const [userAmountInput, setUserAmountInput] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [formError, setFormError] = useState<null | string>(null);

  const { activeApi, activeChain, activeWallet, switchChain } = useWebContext();
  const config = useAppConfig();
  const depositNotes = useDepositNotes(notes);
  const appConfig = useAppConfig();

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
    const chainId = parseChainIdType(Number(depositNotes[0].note.targetChainId)).chainId;
    return activeChain.chainId !== chainId;
  }, [activeChain, depositNotes]);

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
    if (!depositNotes?.length || !firstNote) {
      return 0;
    }

    return depositNotes.reduce((acc, currentNote) => {
      const isMatchDestChain = currentNote.note.targetChainId === firstNote.note.targetChainId;
      const isMatchTokenSymbol = currentNote.note.tokenSymbol === firstNote.note.tokenSymbol;

      return isMatchDestChain && isMatchTokenSymbol
        ? acc + Number(ethers.utils.formatUnits(currentNote.note.amount, currentNote.note.denomination))
        : acc;
    }, 0);
  }, [depositNotes, firstNote]);

  const parseAndSetAmount = (amount: string): void => {
    setUserAmountInput(amount);
    let parsedAmount = Number(amount);
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

  // Side effect for validating form inputs
  useEffect(() => {
    const validateFormInput = () => {
      const set = new Set(notes);

      if (set.size !== notes.length) {
        return setFormError('All notes must have different values');
      }

      if (withdrawAmount > depositAmount) {
        return setFormError('Not enough funds');
      }

      setFormError(null);
    };

    validateFormInput();
  }, [depositAmount, notes, withdrawAmount]);

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

  return (
    <WithdrawWrapper wallet={activeWallet}>
      <InputsContainer style={{ paddingBottom: '0px' }}>
        <InputTitle leftLabel='Add Note(s)' />
      </InputsContainer>
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

      {firstNote && (
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
              <Title>Deposit Amount</Title>
              <Value>
                {depositAmount} {firstNote.note.tokenSymbol}
              </Value>
            </InformationItem>

            <InformationItem>
              <Title>Chains</Title>
              <Value>
                {getChainNameFromChainId(appConfig, parseChainIdType(Number(firstNote.note.sourceChainId)))}
                {` -> `}
                {getChainNameFromChainId(appConfig, parseChainIdType(Number(firstNote.note.targetChainId)))}
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
                {depositAmount - Number(fees)} {firstNote.note.tokenSymbol}
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
                  ? 'Not enough fund'
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
        {outputNotes.length && depositNotes && (
          <WithdrawSuccessModal
            receipt={receipt}
            recipient={recipient}
            changeNote={outputNotes[0].note}
            inputNote={depositNotes[0].note}
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
