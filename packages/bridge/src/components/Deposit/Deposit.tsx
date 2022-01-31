import { Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { DepositConfirm } from '@webb-dapp/bridge/components/DepositConfirm/DepositConfirm';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useBridgeDeposit } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
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
  const bridgeDepositApi = useBridgeDeposit();
  const { activeApi, activeChain, activeWallet, chains, switchChain } = useWebContext();
  // const { clearAmount, token } = useBalanceSelect();
  const { depositApi, selectedBridgeCurrency, setSelectedCurrency } = bridgeDepositApi;
  const activeBridge = depositApi?.activeBridge;

  const srcChain = useMemo(() => {
    if (!activeChain) {
      return undefined;
    }

    return activeChain.id;
  }, [activeChain]);

  const [wrappedTokenBalance, setWrappedTokenBalance] = useState('');

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

  const [item, setItem] = useState<MixerSize | undefined>(undefined);
  const [destChain, setDestChain] = useState<ChainId | undefined>(undefined);

  const tokenChains = useMemo(() => {
    return selectedBridgeCurrency?.getChainIds() ?? [];
  }, [selectedBridgeCurrency]);
  const disabledDepositButton = typeof item?.id === 'undefined' || typeof destChain === 'undefined';

  // boolean flag for displaying the wrapped asset input
  const [showWrappableAssets, setShowWrappableAssets] = useState(false);

  // State for the selectable wrappable assets
  const [wrappableAssets, setWrappableAssets] = useState<Currency[]>([]);

  // State for the selected wrappable asset
  const [wrappableAsset, setWrappableAsset] = useState<Currency | undefined>(undefined);

  const [wrappableTokenBalance, setWrappableTokenBalance] = useState<String>('');

  useEffect(() => {
    if (!wrappableAsset || !activeApi) return;

    // TODO: handle when the token id isn't WebbCurrencyId
    activeApi.methods.chainQuery.tokenBalanceByCurrencyId(wrappableAsset.view.id as any).then((balance) => {
      setWrappableTokenBalance(balance);
    });
  }, [wrappableAsset, activeApi]);

  useEffect(() => {
    if (!selectedBridgeCurrency || !activeChain || !depositApi) return;

    depositApi.getWrappableAssets(activeChain.id).then((wrappableCurrencies) => {
      setShowWrappableAssets(false);
      setWrappableAssets(wrappableCurrencies);
      if (wrappableCurrencies.length) {
        console.log('found a wrappableCurrency');
        setWrappableAsset(wrappableCurrencies[0]);
      }
    });
  }, [activeChain, selectedBridgeCurrency, depositApi]);

  // helper for automatic selection of 'wrap and deposit' if not enough bridge token
  const selectBridgeAmount = (mixerSize: MixerSize) => {
    setItem(mixerSize);
    // get the amount from mixersize data
    const titleData = mixerSize.title.split(' ');
    if (Number(wrappedTokenBalance) < Number(titleData[0])) {
      setShowWrappableAssets(true);
    }
  };

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
            {showWrappableAssets && wrappableAsset && (
              <Typography>
                {wrappableAsset.view.symbol} Balance: {wrappableTokenBalance}
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
                    if (showWrappableAssets) {
                      setWrappableAsset(undefined);
                    } else {
                      setWrappableAsset(wrappableAssets[0]);
                    }
                    setShowWrappableAssets(!showWrappableAssets);
                  }}
                />
              }
            />
          </div>
        </div>
      )}
      {showWrappableAssets && wrappableAssets.length && (
        <>
          {/* used for positioning the token input label */}
          <div style={{ height: '52px' }}></div>
          <TokenInput
            currencies={wrappableAssets}
            value={wrappableAsset}
            onChange={(currencyContent) => {
              if (currencyContent) {
                setWrappableAsset(Currency.fromCurrencyId(currencyContent.view.id as WebbCurrencyId));
              }
            }}
          />
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
          wrappableAsset={wrappableAsset}
        />
      </Modal>
    </DepositWrapper>
  );
};
