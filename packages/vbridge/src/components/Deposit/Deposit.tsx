import {
  ChainTypeId,
  chainTypeIdToInternalId,
  Currency,
  TransactionState,
  WalletConfig,
  WebbCurrencyId,
} from '@webb-dapp/api-providers';
import { useWrapUnwrap } from '@webb-dapp/page-wrap-unwrap/hooks/useWrapUnwrap';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { TransactionProcessingModal } from '@webb-dapp/react-components/Transact/TransactionProcessingModal';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment/webb-context';
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
import { DepositConfirm } from '@webb-dapp/vbridge/components/DepositConfirm/DepositConfirm';
import { useBridge } from '@webb-dapp/vbridge/hooks/bridge/use-bridge';
import { useBridgeDeposit } from '@webb-dapp/vbridge/hooks/deposit/useBridgeDeposit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const DepositWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
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
`;

const ChainInputWrapper = styled.div`
  padding: 25px 35px;
  background: ${({ theme }) => theme.layer2Background};
  border-radius: 0px 0px 13px 13px;
  border: 1px solid ${({ theme }) => theme.borderColor};

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
  padding: 25px 35px;
  background: ${({ theme }) => theme.layer1Background};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-bottom: none;

  .token-dropdown-section {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
  }
`;

type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const [wrappedTokenBalance, setWrappedTokenBalance] = useState('');
  const [userAmountInput, setUserAmountInput] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [destChain, setDestChain] = useState<ChainTypeId | undefined>(undefined);
  const { chains: chainsConfig, currencies: currenciesConfig } = useAppConfig();

  const [wrappableTokenBalance, setWrappableTokenBalance] = useState<String>('');
  // boolean flag for displaying the wrapped asset input
  const [showWrappableAssets, setShowWrappableAssets] = useState(false);

  const { tokens: bridgeCurrencies } = useBridge();
  const bridgeDepositApi = useBridgeDeposit();
  const { selectedBridgeCurrency, setSelectedCurrency, setStage, stage } = bridgeDepositApi;

  const { setWrappableToken, wrappableToken, wrappableTokens } = useWrapUnwrap();
  const { activeApi, activeChain, activeWallet, loading } = useWebContext();

  useEffect(() => {
    if (!activeChain || !activeApi) {
      return;
    }

    // todo: figure out what happens for polkadot - won't be depositing by address
    const tokenAddress = activeApi.methods.anchorApi.getTokenAddress({
      chainId: activeChain.chainId,
      chainType: activeChain.chainType,
    });
    if (!tokenAddress) {
      return;
    }
    activeApi.methods.chainQuery.tokenBalanceByAddress(tokenAddress).then((balance) => {
      setWrappedTokenBalance(balance);
    });
  }, [activeApi, activeChain]);

  // boolean flags for different modal displays
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [hideTxModal, setHideTxModal] = useState(false);

  useEffect(() => {
    // If the stage is in a terminal transaction state, and the modal is hidden, reset to ideal.
    if (stage > TransactionState.SendingTransaction && hideTxModal) {
      setStage(TransactionState.Ideal);
    }
  }, [hideTxModal, setStage, stage]);

  const handleSuccess = useCallback((): void => {}, []);

  const tokenChains = useMemo(() => {
    const chains = selectedBridgeCurrency?.getChainIdsAndTypes(chainsConfig) ?? [];
    return chains;
  }, [chainsConfig, selectedBridgeCurrency]);

  const disabledDepositButton = useMemo(() => {
    return amount === 0 || typeof destChain === 'undefined' || stage != TransactionState.Ideal;
  }, [amount, destChain, stage]);

  const wrappableCurrency = useMemo<Currency | undefined>(() => {
    if (wrappableToken) {
      return Currency.fromCurrencyId(currenciesConfig, wrappableToken.view.id);
    }
    return undefined;
  }, [currenciesConfig, wrappableToken]);

  const balance = useMemo(() => {
    if (showWrappableAssets && wrappableToken && wrappableCurrency) {
      return `${getRoundedAmountString(Number(wrappableTokenBalance))} ${wrappableCurrency.view.symbol}`;
    }

    if (!showWrappableAssets && selectedBridgeCurrency) {
      return `${getRoundedAmountString(Number(wrappedTokenBalance))} ${selectedBridgeCurrency.view.symbol}`;
    }

    return '-';
  }, [
    selectedBridgeCurrency,
    showWrappableAssets,
    wrappableCurrency,
    wrappableToken,
    wrappableTokenBalance,
    wrappedTokenBalance,
  ]);

  const parseAndSetAmount = (amount: string): void => {
    setUserAmountInput(amount);
    let parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setAmount(parsedAmount);
    }
  };

  useEffect(() => {
    if (!wrappableToken || !activeApi || !activeChain || loading) {
      return;
    }
    // TODO: handle when the token id isn't WebbCurrencyId
    activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(activeChain.id, wrappableToken.view.id as any)
      .then((balance) => {
        setWrappableTokenBalance(balance);
      });
  }, [wrappableToken, activeApi, loading, activeChain]);

  useEffect(() => {
    // cleanup the show wrappable assets conditional render if state changes
    return setShowWrappableAssets(false);
  }, [activeChain, wrappableTokens]);

  useEffect(() => {
    if (wrappableTokens && wrappableTokens.length && !wrappableToken) {
      setWrappableToken(wrappableTokens[0]);
      return;
    }
    if (wrappableToken) {
      const isInList = wrappableTokens.findIndex((c) => c.view.id === wrappableToken?.view.id) > -1;
      if (!isInList) {
        setWrappableToken(wrappableTokens[0]);
      }
    }
  }, [setWrappableToken, wrappableTokens, wrappableToken]);

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
                  currencies={wrappableTokens}
                  value={wrappableCurrency}
                  onChange={(currencyContent) => {
                    setWrappableToken(
                      currencyContent
                        ? Currency.fromCurrencyId(currenciesConfig, currencyContent.view.id as WebbCurrencyId)
                        : null
                    );
                  }}
                  wrapperStyles={{ width: '42%' }}
                />
                <CircledArrowRight />
              </>
            )}
            <TokenInput
              currencies={bridgeCurrencies}
              value={selectedBridgeCurrency}
              onChange={(currencyContent) => {
                if (currencyContent) {
                  // TODO validate the id is BridgeCurrency id not WebbCurrencyId
                  setSelectedCurrency(currencyContent.view.id);
                } else {
                  setSelectedCurrency(undefined);
                }
              }}
              wrapperStyles={showWrappableAssets ? { width: '42%' } : { width: '100%' }}
            />
          </div>
        </TokenInputWrapper>
        {selectedBridgeCurrency && (
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
            <MixerButton
              disabled={disabledDepositButton}
              onClick={() => {
                setShowDepositConfirm(true);
              }}
              label={showWrappableAssets ? 'Wrap and Deposit' : 'Deposit'}
            />
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
            destChain={destChain ? chainsConfig[chainTypeIdToInternalId(destChain)].name : ''}
            cancel={() => {
              console.log('user tried to cancel');
            }}
            hide={() => setHideTxModal(true)}
          />
        </Modal>
      </RequiredWalletSelection>
    </DepositWrapper>
  );
};
