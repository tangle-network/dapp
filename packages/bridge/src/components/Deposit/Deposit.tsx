import {
  Currency,
  MixerSize,
  TypedChainId,
  typedChainIdToInternalId,
  WalletConfig,
  WebbCurrencyId,
} from '@webb-dapp/api-providers';
import { DepositConfirm } from '@webb-dapp/bridge/components/DepositConfirm/DepositConfirm';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useBridgeDeposit } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
import { useWrapUnwrap } from '@webb-dapp/page-wrap-unwrap/hooks/useWrapUnwrap';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { BalanceLabel } from '@webb-dapp/ui-components/Inputs/BalanceLabel/BalanceLabel';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { CheckBox } from '@webb-dapp/ui-components/Inputs/CheckBox/CheckBox';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import CircledArrowRight from '@webb-dapp/ui-components/misc/CircledArrowRight';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import { above, useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
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

  .chain-dropdown-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const TokenInputWrapper = styled.div`
  padding: 12px 14px;
  background: ${({ theme }) => theme.layer2Background};
  border-radius: 8px;
  border: 0.5px solid ${({ theme }) => theme.borderColor};

  ${above.xs`
    border-radius: 16px;
    border-width: 1px;
    padding: 25px 35px;
  `}

  .token-dropdown-section {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
`;

const AmountWrapper = styled.div`
  margin-top: 20px;
`;

type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const [wrappedTokenBalance, setWrappedTokenBalance] = useState('');
  const [item, setItem] = useState<MixerSize | undefined>(undefined);
  const [destChain, setDestChain] = useState<TypedChainId | undefined>(undefined);
  const { chains: chainsConfig, currencies: currenciesConfig } = useAppConfig();

  const [wrappableTokenBalance, setWrappableTokenBalance] = useState<String>('');
  // boolean flag for displaying the wrapped asset input
  const [showWrappableAssets, setShowWrappableAssets] = useState(false);

  const { tokens: bridgeCurrencies } = useBridge();
  const bridgeDepositApi = useBridgeDeposit();
  const { selectedBridgeCurrency, setSelectedCurrency } = bridgeDepositApi;

  const { setWrappableToken, wrappableToken, wrappableTokens } = useWrapUnwrap();
  const { activeApi, activeChain, activeWallet, chains, loading, switchChain } = useWebContext();
  const { isXsOrAbove } = useBreakpoint();

  const srcChain = useMemo(() => {
    if (!activeChain) {
      return undefined;
    }

    return activeChain;
  }, [activeChain]);

  useEffect(() => {
    if (!activeChain || !activeApi) {
      return;
    }

    let isSubscribe = true;

    // todo: figure out what happens for polkadot - won't be depositing by address
    const tokenAddress = activeApi.methods.anchorApi.getTokenAddress({
      chainId: activeChain.chainId,
      chainType: activeChain.chainType,
    });

    if (!tokenAddress) {
      return;
    }

    activeApi.methods.chainQuery.tokenBalanceByAddress(tokenAddress).then((balance) => {
      if (isSubscribe) {
        setWrappedTokenBalance(balance);
      }
    });

    return () => {
      isSubscribe = false;
    };
  }, [activeApi, activeChain]);

  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleSuccess = useCallback((): void => {}, []);

  const tokenChains = useMemo(() => {
    const chains = selectedBridgeCurrency?.getChainIdsAndTypes(chainsConfig) ?? [];
    return chains;
  }, [chainsConfig, selectedBridgeCurrency]);

  const disabledDepositButton = useMemo(() => {
    return typeof item?.id === 'undefined' || typeof destChain === 'undefined';
  }, [item, destChain]);

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

  useEffect(() => {
    let isSubscribe = true;

    if (!wrappableToken || !activeApi || !activeChain || loading) {
      return;
    }
    // TODO: handle when the token id isn't WebbCurrencyId
    activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(activeChain.id, wrappableToken.view.id as any)
      .then((balance) => {
        if (isSubscribe) {
          setWrappableTokenBalance(balance);
        }
      });

    return () => {
      isSubscribe = false;
    };
  }, [wrappableToken, activeApi, loading, activeChain]);

  // helper for automatic selection of 'wrap and deposit' if not enough bridge token
  const selectBridgeAmount = (mixerSize: MixerSize) => {
    setItem(mixerSize);
    if (Number(wrappedTokenBalance) < mixerSize.amount) {
      if (wrappableToken) {
        setShowWrappableAssets(true);
      }
    }
  };

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
        <ChainInputWrapper>
          <InputTitle leftLabel='CHAIN' />
          <div className='chain-dropdown-section'>
            <ChainInput
              chains={tokenChains}
              // TODO: Figure out how to embed the chain type for the active chain
              selectedChain={{ chainType: srcChain?.chainType || -1, chainId: srcChain?.chainId || -1 }}
              setSelectedChain={async (chainId) => {
                if (typeof chainId !== 'undefined' && activeWallet) {
                  const nextChain = chains[typedChainIdToInternalId(chainId)];
                  await switchChain(nextChain, activeWallet);
                }
              }}
              wrapperStyles={{ width: '42%' }}
            />
            <CircledArrowRight />
            <ChainInput
              chains={tokenChains}
              selectedChain={destChain}
              setSelectedChain={setDestChain}
              wrapperStyles={{ width: '42%' }}
            />
          </div>
        </ChainInputWrapper>
        <TokenInputWrapper>
          <InputTitle
            leftLabel='TOKEN'
            rightLabel={
              <CheckBox
                label='Wrap Assets?'
                size={isXsOrAbove ? 'medium' : 'small'}
                checked={showWrappableAssets}
                onChange={() => {
                  setShowWrappableAssets(!showWrappableAssets);
                }}
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
          {typeof destChain !== 'undefined' && (
            <AmountWrapper>
              <InputTitle leftLabel='AMOUNT' rightLabel={balance && <BalanceLabel value={balance} />} />
              <MixerGroupSelect items={bridgeDepositApi.mixerSizes} value={item} onChange={selectBridgeAmount} />
            </AmountWrapper>
          )}
          <SpaceBox height={16} />
          <MixerButton
            disabled={disabledDepositButton}
            onClick={() => {
              setShowDepositModal(true);
            }}
            label={showWrappableAssets ? 'Wrap and Deposit' : 'Deposit'}
          />
        </TokenInputWrapper>
        <Modal open={showDepositModal}>
          <DepositConfirm
            onSuccess={() => {
              handleSuccess();
              setShowDepositModal(false);
            }}
            open={showDepositModal}
            onClose={() => {
              setShowDepositModal(false);
            }}
            provider={bridgeDepositApi}
            mixerSize={item}
            destChain={destChain}
            wrappableAsset={showWrappableAssets ? wrappableCurrency : null}
          />
        </Modal>
      </RequiredWalletSelection>
    </DepositWrapper>
  );
};
