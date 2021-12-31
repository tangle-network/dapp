import { Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { DepositConfirm } from '@webb-dapp/bridge/components/DepositConfirm/DepositConfirm';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useBridgeDeposit } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
import { Erc20Factory } from '@webb-dapp/contracts/types';
import { Currency } from '@webb-dapp/react-environment/types/currency';
import { MixerSize, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { WalletBridgeCurrencyInput } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const DepositWrapper = styled.div``;
type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const bridgeApi = useBridge();
  const bridgeDepositApi = useBridgeDeposit();
  const { activeApi, activeChain, activeWallet, chains, switchChain } = useWebContext();
  // const { clearAmount, token } = useBalanceSelect();
  const { depositApi } = bridgeDepositApi;
  const activeBridge = depositApi?.activeBridge;
  const selectedBridgeCurrency = useMemo(() => {
    if (!activeBridge) {
      return undefined;
    }

    return activeBridge.currency;
  }, [activeBridge]);

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

  // helper for automatic selection of 'wrap and deposit' if not enough bridge token
  const selectBridgeAmount = (mixerSize: MixerSize) => {
    setItem(mixerSize);
    // get the amount from mixersize data
    const titleData = mixerSize.title.split(' ');
    if (Number(wrappedTokenBalance) < Number(titleData[0])) {
      setShowWrappableAssets(true);
    }
  };

  const tokenChains = useMemo(() => {
    return selectedBridgeCurrency?.chainIds ?? [];
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

    activeApi.methods.chainQuery.tokenBalanceByCurrencyId(wrappableAsset.view.id).then((balance) => {
      setWrappableTokenBalance(balance);
    });
  }, [wrappableAsset, activeApi]);

  useEffect(() => {
    if (!selectedBridgeCurrency || !activeChain || !bridgeDepositApi.depositApi) return;

    bridgeDepositApi.depositApi.getWrappableAssets(activeChain.id).then((wrappableCurrencies) => {
      console.log(wrappableCurrencies);
      setWrappableAssets(wrappableCurrencies);
    });
  }, [activeChain, selectedBridgeCurrency, bridgeDepositApi.depositApi]);

  return (
    <DepositWrapper>
      <WalletBridgeCurrencyInput
        setSelectedToken={bridgeDepositApi.setSelectedCurrency}
        selectedToken={bridgeDepositApi.selectedBridgeCurrency ?? undefined}
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
                {selectedBridgeCurrency?.prefix} Balance: {wrappedTokenBalance}
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
                    // Clear the selected wrappable asset if unchecked
                    if (showWrappableAssets) {
                      setWrappableAsset(undefined);
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
