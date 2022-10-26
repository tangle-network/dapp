import { WalletConfig } from '@nepoche/dapp-config';
import { TransactionState } from '@nepoche/dapp-types';
import { ChainInput } from '@nepoche/react-components/ChainInput/ChainInput';
import { DepositConfirm } from '@nepoche/react-components/Deposit/DepositConfirm';
import { RequiredWalletSelection } from '@nepoche/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { TransactionProcessingModal } from '@nepoche/react-components/Transact/TransactionProcessingModal';
import { useApiConfig, useWebContext } from '@nepoche/api-provider-environment';
import { useCurrencies } from '@nepoche/react-hooks/currency';
import { useCurrencyBalance } from '@nepoche/react-hooks/currency/useCurrencyBalance';
import { useBridgeDeposit } from '@nepoche/react-hooks/deposit/useBridgeDeposit';
import { SpaceBox } from '@nepoche/ui-components/Box';
import { MixerButton } from '@nepoche/ui-components/Buttons/MixerButton';
import { AmountInput } from '@nepoche/ui-components/Inputs/AmountInput/AmountInput';
import { BalanceLabel } from '@nepoche/ui-components/Inputs/BalanceLabel/BalanceLabel';
import { CheckBox } from '@nepoche/ui-components/Inputs/CheckBox/CheckBox';
import { InputTitle } from '@nepoche/ui-components/Inputs/InputTitle/InputTitle';
import { TokenInput } from '@nepoche/react-components';
import CircledArrowRight from '@nepoche/ui-components/misc/CircledArrowRight';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import { Pallet } from '@nepoche/styled-components-theme';
import { getRoundedAmountString } from '@nepoche/ui-components/utils';
import { above } from '@nepoche/responsive-utils';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const sharedPadding = css`
  padding: 12px 14px;

  ${above.xs(css`
    padding: 25px 35px;
  `)}
`;

const DepositWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
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

const TokenInputWrapper = styled.div`
  ${sharedPadding}

  .token-dropdown-section {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
  }
`;

export const Deposit: React.FC = () => {
  const [userAmountInput, setUserAmountInput] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [destChain, setDestChain] = useState<number | undefined>(undefined);
  const [registered, setRegistration] = useState<boolean>(false);
  const { chains: chainsConfig } = useApiConfig();

  // boolean flag for displaying the wrapped asset input
  const [showWrappableAssets, setShowWrappableAssets] = useState(false);

  const bridgeDepositApi = useBridgeDeposit();
  const { cancel, setGovernedCurrency, setStage, setWrappableCurrency, stage } = bridgeDepositApi;

  const { governedCurrencies, governedCurrency, wrappableCurrencies, wrappableCurrency } = useCurrencies();
  const { activeAccount, activeApi, activeChain, activeWallet, noteManager } = useWebContext();

  const governedCurrencyBalance = useCurrencyBalance(governedCurrency);
  const wrappableCurrencyBalance = useCurrencyBalance(wrappableCurrency);

  // boolean flags for different modal displays
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [hideTxModal, setHideTxModal] = useState(false);

  useEffect(() => {
    // If the stage is in a terminal transaction state, and the modal is hidden, reset to ideal.
    if ((stage > TransactionState.SendingTransaction || stage === TransactionState.Cancelling) && hideTxModal) {
      setStage(TransactionState.Ideal);
      setHideTxModal(false);
    }
  }, [hideTxModal, setStage, stage]);

  useEffect(() => {
    // Check if the account and pubkey pairing has been registered on-chain
    if (noteManager && activeChain && activeAccount && activeApi && activeApi.state.activeBridge) {
      const pubkey = noteManager.getKeypair().toString();
      const currentTarget =
        activeApi.state.activeBridge.targets[calculateTypedChainId(activeChain.chainType, activeChain.chainId)]!;
      activeApi.methods.variableAnchor.actions.inner
        .isPairRegistered(currentTarget, activeAccount.address, pubkey)
        .then((res) => {
          if (res != registered) {
            setRegistration(res);
          }
        });
    } else {
      if (registered === true) {
        setRegistration(false);
      }
    }
  }, [registered, noteManager, activeAccount, activeApi, activeChain, activeApi?.state.activeBridge]);

  // Return an array of supported typedChainIds for the active bridge
  const tokenChains = useMemo((): number[] => {
    if (!activeApi?.state.activeBridge) {
      return [];
    }
    const typedChainIds =
      Object.keys(activeApi.state.activeBridge.targets).map((chainIdType) => Number(chainIdType)) ?? [];
    return typedChainIds;
  }, [activeApi?.state.activeBridge]);

  const balance = useMemo(() => {
    if (showWrappableAssets && wrappableCurrency) {
      return `${getRoundedAmountString(Number(wrappableCurrencyBalance))} ${wrappableCurrency.view.symbol}`;
    }

    if (!showWrappableAssets && governedCurrency) {
      return `${getRoundedAmountString(Number(governedCurrencyBalance))} ${governedCurrency.view.symbol}`;
    }

    return '-';
  }, [governedCurrency, governedCurrencyBalance, showWrappableAssets, wrappableCurrency, wrappableCurrencyBalance]);

  const disabledDepositButton = useMemo(() => {
    const insufficientInputs = amount === 0 || typeof destChain === 'undefined' || stage != TransactionState.Ideal;

    let enoughBalance = false;
    if (showWrappableAssets) {
      if (wrappableCurrencyBalance && wrappableCurrencyBalance > amount) {
        enoughBalance = true;
      }
    } else {
      if (governedCurrencyBalance && governedCurrencyBalance > amount) {
        enoughBalance = true;
      }
    }

    return insufficientInputs || !enoughBalance;
  }, [amount, destChain, stage, showWrappableAssets, wrappableCurrencyBalance, governedCurrencyBalance]);

  const actionButton = useMemo(() => {
    if (activeApi && activeChain && activeAccount && activeApi.state.activeBridge && noteManager && !registered) {
      const keyData = noteManager.getKeypair().toString();
      const currentTarget =
        activeApi.state.activeBridge.targets[calculateTypedChainId(activeChain.chainType, activeChain.chainId)]!;
      return (
        <MixerButton
          onClick={() => {
            activeApi.methods.variableAnchor.actions.inner
              .register(currentTarget, activeAccount.address, keyData)
              .then((res) => {
                if (res) {
                  setRegistration(true);
                }
              });
          }}
          label={'Register'}
        />
      );
    }

    return (
      <MixerButton
        disabled={disabledDepositButton}
        onClick={() => {
          setShowDepositConfirm(true);
        }}
        label={showWrappableAssets ? 'Wrap and Deposit' : 'Deposit'}
      />
    );
  }, [activeAccount, activeApi, activeChain, disabledDepositButton, noteManager, registered, showWrappableAssets]);

  const parseAndSetAmount = (amount: string): void => {
    setUserAmountInput(amount);
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setAmount(parsedAmount);
    }
  };

  return (
    <DepositWrapper wallet={activeWallet}>
      <RequiredWalletSelection>
        <TokenInputWrapper>
          <InputTitle
            leftLabel='TOKEN'
            rightLabel={
              <CheckBox
                checked={showWrappableAssets}
                onChange={() => {
                  setShowWrappableAssets(!showWrappableAssets);
                }}
                label='Wrap Assets?'
              />
            }
          />
          <div className='token-dropdown-section'>
            {showWrappableAssets && (
              <>
                <TokenInput
                  currencies={wrappableCurrencies}
                  value={wrappableCurrency}
                  onChange={(currency) => {
                    setWrappableCurrency(currency);
                  }}
                  wrapperStyles={{ width: '42%' }}
                />
                <CircledArrowRight />
              </>
            )}
            <TokenInput
              currencies={governedCurrencies}
              value={governedCurrency}
              onChange={(currency) => {
                setGovernedCurrency(currency);
              }}
              wrapperStyles={showWrappableAssets ? { width: '42%' } : { width: '100%' }}
            />
          </div>
        </TokenInputWrapper>
        {activeApi?.state.activeBridge && (
          <ChainInputWrapper>
            {registered && (
              <>
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
              </>
            )}
            {actionButton}
          </ChainInputWrapper>
        )}
        <Modal open={showDepositConfirm}>
          <DepositConfirm
            onSuccess={() => {
              setShowDepositConfirm(false);
            }}
            open={showDepositConfirm}
            onClose={() => {
              setShowDepositConfirm(false);
            }}
            anchorId={0}
            provider={bridgeDepositApi}
            amount={amount}
            destChain={destChain}
            wrappableAsset={showWrappableAssets ? wrappableCurrency : null}
          />
        </Modal>

        <Modal open={!hideTxModal && stage != TransactionState.Ideal} onClose={() => setHideTxModal(true)}>
          <TransactionProcessingModal
            txFlow={'Deposit'}
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
    </DepositWrapper>
  );
};
