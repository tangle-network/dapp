import { Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { DepositConfirm } from '@webb-dapp/bridge/components/DepositConfirm/DepositConfirm';
import { useBridgeDeposit } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
import { useWrapUnwrap } from '@webb-dapp/page-wrap-unwrap/hooks/useWrapUnwrap';
import { MixerSize, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { WalletBridgeCurrencyInput } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const DepositWrapper = styled.div``;
type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const [wrappedTokenBalance, setWrappedTokenBalance] = useState('');
  const [item, setItem] = useState<MixerSize | undefined>(undefined);
  const [destChain, setDestChain] = useState<ChainId | undefined>(undefined);

  const [wrappableTokenBalance, setWrappableTokenBalance] = useState<String>('');
  // boolean flag for displaying the wrapped asset input
  const [showWrappableAssets, setShowWrappableAssets] = useState(false);

  const bridgeDepositApi = useBridgeDeposit();
  const { depositApi, selectedBridgeCurrency, setSelectedCurrency } = bridgeDepositApi;
  const activeBridge = depositApi?.activeBridge;
  const { setWrappableToken, wrappableToken, wrappableTokens } = useWrapUnwrap();
  const { activeApi, activeChain, activeWallet, chains, loading, switchChain } = useWebContext();

  const srcChain = useMemo(() => {
    if (!activeChain) {
      return undefined;
    }

    return activeChain.id;
  }, [activeChain]);

  useEffect(() => {
    if (!activeChain || !activeBridge || !activeApi) return;

    // todo: figure out what happens for polkadot - won't be depositing by address
    const tokenAddress = activeBridge.getTokenAddress(activeChain.id)!;
    activeApi.methods.chainQuery.tokenBalanceByAddress(tokenAddress).then((balance) => {
      setWrappedTokenBalance(balance);
    });
  }, [activeApi, activeBridge, activeChain]);

  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleSuccess = useCallback((): void => {}, []);

  const tokenChains = useMemo(() => {
    return selectedBridgeCurrency?.getChainIds() ?? [];
  }, [selectedBridgeCurrency]);

  const disabledDepositButton = useMemo(() => {
    return typeof item?.id === 'undefined' || typeof destChain === 'undefined';
  }, [item, destChain]);

  const wrappableCurrency = useMemo<Currency | undefined>(() => {
    if (wrappableToken) {
      return Currency.fromCurrencyId(wrappableToken.view.id);
    }
    return undefined;
  }, [wrappableToken]);

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
    // get the amount from mixersize data
    const titleData = mixerSize.title.split(' ');
    if (Number(wrappedTokenBalance) < Number(titleData[0])) {
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
    }
  }, [setWrappableToken, wrappableTokens, wrappableToken]);
  console.log(selectedBridgeCurrency, 'selectedBridgeCurrency');
  return (
    <DepositWrapper>
      <WalletBridgeCurrencyInput
        setSelectedToken={setSelectedCurrency}
        selectedToken={selectedBridgeCurrency ?? undefined}
      />
      <SpaceBox height={16} />
      <ChainInput
        chains={tokenChains}
        label={'Select Source Chain'}
        selectedChain={srcChain}
        // TODO: Hook this up to network switcher
        setSelectedChain={async (chainId) => {
          if (typeof chainId !== 'undefined' && activeWallet) {
            const nextChain = chains[chainId];
            await switchChain(nextChain, activeWallet);
          }
        }}
      />
      <SpaceBox height={16} />
      <ChainInput
        label={'Select Destination Chain'}
        chains={tokenChains}
        selectedChain={destChain}
        setSelectedChain={setDestChain}
      />
      <SpaceBox height={16} />
      {typeof destChain !== 'undefined' && (
        <MixerGroupSelect items={bridgeDepositApi.mixerSizes} value={item} onChange={selectBridgeAmount} />
      )}
      {selectedBridgeCurrency && typeof destChain !== 'undefined' && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {showWrappableAssets && wrappableToken && wrappableCurrency && (
              <Typography>
                {wrappableCurrency.view.symbol} Balance: {wrappableTokenBalance}
              </Typography>
            )}
            {!showWrappableAssets && selectedBridgeCurrency && (
              <Typography>
                {selectedBridgeCurrency?.view.symbol} Balance: {wrappedTokenBalance}
              </Typography>
            )}
          </div>
          <div style={{ alignItems: 'center' }}>
            <FormControlLabel
              label={'Wrap Assets'}
              control={
                <Checkbox
                  checked={showWrappableAssets}
                  onChange={() => {
                    setShowWrappableAssets(!showWrappableAssets);
                  }}
                />
              }
            />
          </div>
        </div>
      )}
      {showWrappableAssets && wrappableTokens.length && (
        <TokenInput
          currencies={wrappableTokens}
          value={wrappableCurrency}
          onChange={(currencyContent) => {
            setWrappableToken(
              currencyContent ? Currency.fromCurrencyId(currencyContent.view.id as WebbCurrencyId) : null
            );
          }}
        />
      )}
      <SpaceBox height={16} />
      <MixerButton
        disabled={disabledDepositButton}
        onClick={() => {
          setShowDepositModal(true);
        }}
        label={showWrappableAssets ? 'Wrap and Deposit' : 'Deposit'}
      />
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
          mixerId={item?.id ? (item.id as any) : undefined}
          destChain={destChain}
          wrappableAsset={showWrappableAssets ? wrappableCurrency : null}
        />
      </Modal>
    </DepositWrapper>
  );
};
