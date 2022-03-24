import { Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { ChainTypeId, chainTypeIdToInternalId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { DepositConfirm } from '@webb-dapp/bridge/components/DepositConfirm/DepositConfirm';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useBridgeDeposit } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
import { useWrapUnwrap } from '@webb-dapp/page-wrap-unwrap/hooks/useWrapUnwrap';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import CircledArrowRight from '@webb-dapp/ui-components/misc/CircledArrowRight';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import { MixerSize } from '@webb-tools/api-providers';
import { WalletConfig } from '@webb-tools/api-providers/types/wallet-config.interface';
import { Currency } from '@webb-tools/api-providers/webb-context/currency/currency';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const DepositWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  ${({ theme, wallet }) => {
    if (wallet) return css``;
    else
      return css`
        padding: 25px 35px;
        background: ${theme.layer2Background};
        border: 1px solid ${theme.borderColor};
        border-radius: 0 0 13px 13px;
      `;
  }}
`;

const ChainInputWrapper = styled.div`
  padding: 25px 35px;
  background: ${({ theme }) => theme.layer1Background};

  .chain-dropdown-section {
    display: flex;
    justify-content: space-between;
  }
`;
const TokenInputWrapper = styled.div`
  padding: 25px 35px;
  background: ${({ theme }) => theme.layer2Background};
  border-radius: 13px;
  border: 1px solid ${({ theme }) => theme.borderColor};

  .titles-and-information {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .token-dropdown-section {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
  }
`;

const TokenBalance = styled.div`
  border: 1px solid ${({ theme }) => theme.primaryText};
  border-radius: 5px;
  margin-left: 5px;
  padding: 0 5px;
`;

type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const [wrappedTokenBalance, setWrappedTokenBalance] = useState('');
  const [item, setItem] = useState<MixerSize | undefined>(undefined);
  const [destChain, setDestChain] = useState<ChainTypeId | undefined>(undefined);
  const { chains: chainsConfig, currencies: currenciesConfig } = useAppConfig();

  const [wrappableTokenBalance, setWrappableTokenBalance] = useState<String>('');
  // boolean flag for displaying the wrapped asset input
  const [showWrappableAssets, setShowWrappableAssets] = useState(false);

  const { tokens: bridgeCurrencies } = useBridge();
  const bridgeDepositApi = useBridgeDeposit();
  const { depositApi, selectedBridgeCurrency, setSelectedCurrency } = bridgeDepositApi;

  const { setWrappableToken, wrappableToken, wrappableTokens } = useWrapUnwrap();
  const { activeApi, activeChain, activeWallet, chains, loading, switchChain } = useWebContext();
  const palette = useColorPallet();

  const srcChain = useMemo(() => {
    if (!activeChain) {
      return undefined;
    }

    return activeChain;
  }, [activeChain]);

  useEffect(() => {
    if (!activeChain || !activeApi) return;

    // todo: figure out what happens for polkadot - won't be depositing by address
    const tokenAddress = activeApi.methods.bridgeApi.getTokenAddress({
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

  useEffect(() => {
    if (!wrappableToken || !activeApi || loading) return;
    // TODO: handle when the token id isn't WebbCurrencyId
    activeApi.methods.chainQuery.tokenBalanceByCurrencyId(wrappableToken.view.id as any).then((balance) => {
      setWrappableTokenBalance(balance);
    });
  }, [wrappableToken, activeApi, loading]);

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
          <Typography variant={'h6'} style={{ marginBottom: '10px' }}>
            <b>CHAIN</b>
          </Typography>
          <div className='chain-dropdown-section'>
            <ChainInput
              chains={tokenChains}
              // TODO: Figure out how to embed the chain type for the active chain
              selectedChain={{ chainType: srcChain?.chainType || -1, chainId: srcChain?.chainId || -1 }}
              setSelectedChain={async (chainId) => {
                if (typeof chainId !== 'undefined' && activeWallet) {
                  const nextChain = chains[chainTypeIdToInternalId(chainId)];
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
          <div className='titles-and-information'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>
                <b>TOKEN</b>
              </Typography>
            </div>
            <FormControlLabel
              label={'Wrap Assets?'}
              control={
                <Checkbox
                  checked={showWrappableAssets}
                  onChange={() => {
                    setShowWrappableAssets(!showWrappableAssets);
                  }}
                  style={{ color: palette.accentColor }}
                />
              }
            />
          </div>
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
            <>
              <div className='titles-and-information'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant='h6'>
                    <b>AMOUNT</b>
                  </Typography>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <Typography
                      variant='body2'
                      style={{ color: palette.type === 'dark' ? palette.accentColor : palette.primaryText }}
                    >
                      Your Balance~
                    </Typography>
                  </div>
                  <TokenBalance>
                    {showWrappableAssets && wrappableToken && wrappableCurrency && (
                      <Typography variant='body2'>
                        <b>
                          {getRoundedAmountString(Number(wrappableTokenBalance))} {wrappableCurrency.view.symbol}
                        </b>
                      </Typography>
                    )}
                    {!showWrappableAssets && selectedBridgeCurrency && (
                      <Typography variant='body2'>
                        {getRoundedAmountString(Number(wrappedTokenBalance))} {selectedBridgeCurrency?.view.symbol}
                      </Typography>
                    )}
                  </TokenBalance>
                </div>
              </div>
              <MixerGroupSelect items={bridgeDepositApi.mixerSizes} value={item} onChange={selectBridgeAmount} />
            </>
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
