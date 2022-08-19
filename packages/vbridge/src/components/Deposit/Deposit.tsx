import { TransactionState, WalletConfig } from '@webb-dapp/api-providers';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { TransactionProcessingModal } from '@webb-dapp/react-components/Transact/TransactionProcessingModal';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useCurrencies } from '@webb-dapp/react-hooks/currency';
import { useCurrencyBalance } from '@webb-dapp/react-hooks/currency/useCurrencyBalance';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { AmountInput } from '@webb-dapp/ui-components/Inputs/AmountInput/AmountInput';
import { BalanceLabel } from '@webb-dapp/ui-components/Inputs/BalanceLabel/BalanceLabel';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { CheckBox } from '@webb-dapp/ui-components/Inputs/CheckBox/CheckBox';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import CircledArrowRight from '@webb-dapp/ui-components/misc/CircledArrowRight';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { DepositConfirm } from '@webb-dapp/vbridge/components/DepositConfirm/DepositConfirm';
import { useBridgeDeposit } from '@webb-dapp/vbridge/hooks/deposit/useBridgeDeposit';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const [userAmountInput, setUserAmountInput] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [destChain, setDestChain] = useState<number | undefined>(undefined);
  const [registered, setRegistration] = useState<boolean>(false);
  const { chains: chainsConfig } = useAppConfig();

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
    if (stage > TransactionState.SendingTransaction && hideTxModal) {
      setStage(TransactionState.Ideal);
      setHideTxModal(false);
    }
  }, [hideTxModal, setStage, stage]);

  useEffect(() => {
    // Check if the account and pubkey pairing has been registered on-chain
    if (noteManager && activeChain && activeAccount && activeApi && activeApi.state.activeBridge) {
      const pubkey = noteManager.getKeypair().pubkey.toHexString();
      const currentTarget =
        activeApi.state.activeBridge.targets[calculateTypedChainId(activeChain.chainType, activeChain.chainId)]!;
      activeApi.methods.variableAnchor.registration.inner
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

  const handleSuccess = useCallback((): void => {}, []);

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
      const pubkey = noteManager.getKeypair().pubkey.toHexString();
      const currentTarget =
        activeApi.state.activeBridge.targets[calculateTypedChainId(activeChain.chainType, activeChain.chainId)]!;
      return (
        <MixerButton
          onClick={() => {
            activeApi.methods.variableAnchor.registration.inner
              .register(currentTarget, activeAccount.address, pubkey)
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
    let parsedAmount = Number(amount);
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
              handleSuccess();
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
