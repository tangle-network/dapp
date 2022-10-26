import { InputBase } from '@mui/material';
import { TransactionState, WebbRelayer } from '@nepoche/abstract-api-provider';
import { WalletConfig } from '@nepoche/dapp-config/wallets';
import { ChainInput } from '@nepoche/react-components/ChainInput/ChainInput';
import { RequiredWalletSelection } from '@nepoche/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { TransactionProcessingModal } from '@nepoche/react-components/Transact/TransactionProcessingModal';
import { useApiConfig, useWebContext } from '@nepoche/api-provider-environment';
import { useCurrencies } from '@nepoche/react-hooks/currency';
import { useTransfer } from '@nepoche/react-hooks/transfer/useTransfer';
import { getRelayerManagerFactory } from '@nepoche/relayer-manager-factory';
import { SpaceBox } from '@nepoche/ui-components/Box';
import { MixerButton } from '@nepoche/ui-components/Buttons/MixerButton';
import { AmountInput } from '@nepoche/ui-components/Inputs/AmountInput/AmountInput';
import { BalanceLabel } from '@nepoche/ui-components/Inputs/BalanceLabel/BalanceLabel';
import { InputTitle } from '@nepoche/ui-components/Inputs/InputTitle/InputTitle';
import { RelayerApiAdapter, RelayerInput } from '@nepoche/react-components/RelayerInput/RelayerInput';
import { TokenInput } from '@nepoche/react-components/TokenInput/TokenInput';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import { Pallet } from '@nepoche/styled-components-theme';
import { getRoundedAmountString } from '@nepoche/ui-components/utils';
import { above } from '@nepoche/responsive-utils';
import { calculateTypedChainId, FixedPointNumber, Note } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const sharedPadding = css`
  padding: 12px 14px;

  ${above.xs(css`
    padding: 25px 35px;
  `)}
`;

const TransferWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  border-radius: 16px;

  ${({ theme, wallet }) => {
    if (wallet) {
      return css`
        background: ${({ theme }) => theme.layer1Background};
      `;
    } else {
      return css`
        ${sharedPadding}

        background: ${theme.layer2Background};
        border: 1px solid ${theme.borderColor};
      `;
    }
  }}
`;

const ChainInputWrapper = styled.div`
  ${sharedPadding}
  background: ${({ theme }) => theme.layer2Background};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px;

  .chain-dropdown-section {
    display: flex;
    justify-content: space-between;
  }

  .amount-input-section {
    display: flex;
    ${({ theme }: { theme: Pallet }) => css`
      border: 1px solid ${theme.heavySelectionBorderColor};
      color: ${theme.primaryText};
      background: ${theme.heavySelectionBackground};
    `}
    height: 40px;
    border-radius: 10px;
    padding: 5px;
  }
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

const TokenInputWrapper = styled.div`
  ${sharedPadding}

  .token-dropdown-section {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
  }
`;

export const Transfer: React.FC = () => {
  const [userAmountInput, setUserAmountInput] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [destChain, setDestChain] = useState<number | undefined>(undefined);
  const [recipient, setRecipient] = useState('');
  const [fees, setFees] = useState('0');

  const { activeApi, activeChain, activeWallet, noteManager } = useWebContext();

  const depositNotes = useMemo<Note[]>(() => {
    const notes =
      noteManager && activeChain && activeApi
        ? noteManager
            .getAllNotes()
            .get(calculateTypedChainId(activeChain.chainType, activeChain.chainId).toString())
            ?.filter((note) => note.note.tokenSymbol === activeApi.state.activeBridge?.currency.view.symbol) ?? []
        : [];

    return notes;
  }, [noteManager, activeChain, activeApi]);
  const firstNote = useMemo<Note | null>(() => (!depositNotes.length ? null : depositNotes[0]), [depositNotes]);

  const { chains: chainsConfig } = useApiConfig();
  const { cancel, relayersState, setGovernedCurrency, setRelayer, setStage, stage, transfer } = useTransfer({
    notes: depositNotes,
    recipient: recipient,
    destination: destChain,
    amount,
  });

  const { governedCurrencies, governedCurrency } = useCurrencies();

  const spendableBalance = useMemo<string | null>(
    () =>
      !depositNotes.length
        ? null
        : ethers.utils.formatUnits(
            depositNotes.reduce(
              (previous, current) => previous.add(ethers.BigNumber.from(current.note.amount)),
              ethers.BigNumber.from(0)
            ),
            depositNotes[0].note.denomination
          ),
    [depositNotes]
  );

  // boolean flags for different modal displays
  const [hideTxModal, setHideTxModal] = useState(false);

  const relayerApi: RelayerApiAdapter = useMemo(() => {
    return {
      getInfo: async (endpoint: string) => {
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

  const tokenChains = useMemo((): number[] => {
    if (!activeApi?.state.activeBridge) {
      return [];
    }
    const typedChainIds =
      Object.keys(activeApi.state.activeBridge.targets).map((chainIdType) => Number(chainIdType)) ?? [];
    return typedChainIds;
  }, [activeApi?.state.activeBridge]);

  const balance = useMemo(() => {
    if (governedCurrency) {
      return `${getRoundedAmountString(Number(spendableBalance))} ${governedCurrency.view.symbol}`;
    }

    return '-';
  }, [governedCurrency, spendableBalance]);

  const disabledDepositButton = useMemo(() => {
    const insufficientInputs = amount === 0 || typeof destChain === 'undefined' || stage != TransactionState.Ideal;

    let enoughBalance = false;
    if (spendableBalance && Number(spendableBalance) > amount) {
      enoughBalance = true;
    }

    return insufficientInputs || !enoughBalance;
  }, [amount, destChain, stage, spendableBalance]);

  const actionButton = useMemo(() => {
    return (
      <MixerButton
        disabled={disabledDepositButton}
        onClick={() => {
          transfer();
        }}
        label={'Transfer'}
      />
    );
  }, [disabledDepositButton, transfer]);

  const parseAndSetAmount = (amount: string): void => {
    setUserAmountInput(amount);
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setAmount(parsedAmount);
    }
  };

  useEffect(() => {
    // If the stage is in a terminal transaction state, and the modal is hidden, reset to ideal.
    if ((stage > TransactionState.SendingTransaction || stage === TransactionState.Cancelling) && hideTxModal) {
      setStage(TransactionState.Ideal);
      setHideTxModal(false);
    }
  }, [hideTxModal, setStage, stage]);

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
    <TransferWrapper wallet={activeWallet}>
      <RequiredWalletSelection>
        <TokenInputWrapper>
          <InputTitle leftLabel='TOKEN' />
          <div className='token-dropdown-section'>
            <TokenInput
              currencies={governedCurrencies}
              value={governedCurrency}
              onChange={(currency) => {
                setGovernedCurrency(currency);
              }}
              wrapperStyles={{ width: '100%' }}
            />
          </div>
        </TokenInputWrapper>
        {activeApi?.state.activeBridge && (
          <ChainInputWrapper>
            <InputTitle leftLabel='DESTINATION' rightLabel={<BalanceLabel value={balance} />} />
            <div className='chain-dropdown-section'>
              <ChainInput
                chains={tokenChains}
                selectedChain={destChain}
                setSelectedChain={setDestChain}
                wrapperStyles={{ width: '42%' }}
              />
              <div className='amount-input-section'>
                <AmountInput error={''} onChange={parseAndSetAmount} value={userAmountInput} />
              </div>
            </div>
            <SpaceBox height={16} />
            <InputWrapper>
              <InputTitle leftLabel='Recipient Pubkey' />
              <div className='address-input'>
                <InputBase
                  value={recipient}
                  onChange={(event) => {
                    setRecipient(event.target.value as string);
                  }}
                  inputProps={{ style: { fontSize: 14 } }}
                  fullWidth
                  placeholder={`Please paste pubkey here`}
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
            {actionButton}
          </ChainInputWrapper>
        )}

        <Modal open={!hideTxModal && stage != TransactionState.Ideal} onClose={() => setHideTxModal(true)}>
          <TransactionProcessingModal
            txFlow={'Transfer'}
            state={stage}
            amount={amount}
            sourceChain={activeChain ? activeChain.name : ''}
            destChain={destChain ? chainsConfig[destChain].name : ''}
            cancel={async () => {
              await cancel();
            }}
            hide={() => setHideTxModal(true)}
          />
        </Modal>
      </RequiredWalletSelection>
    </TransferWrapper>
  );
};
