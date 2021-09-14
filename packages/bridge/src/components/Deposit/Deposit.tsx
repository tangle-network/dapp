import { ChainId } from '@webb-dapp/apps/configs';
import { DepositConfirm } from '@webb-dapp/bridge/components/DepositConfirm/DepositConfirm';
import { useBridgeDeposit } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
import { MixerSize, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { WalletBridgeCurrencyInput } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { MixerButton } from '../MixerButton/MixerButton';

const DepositWrapper = styled.div``;
type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const bridgeDepositApi = useBridgeDeposit();
  const { activeChain, chains, activeWallet, switchChain } = useWebContext();
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

  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleSuccess = useCallback((): void => {}, []);
  // const [selectedToken, setSelectedToken] = useState<Currency | undefined>(undefined);

  const [item, setItem] = useState<MixerSize | undefined>(undefined);
  const [destChain, setDestChain] = useState<ChainId | undefined>(undefined);
  const tokenChains = useMemo(() => {
    return selectedBridgeCurrency?.chainIds ?? [];
  }, [selectedBridgeCurrency]);
  const disabledDepositButton = typeof item?.id === 'undefined' || typeof destChain === 'undefined';
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
        <MixerGroupSelect items={bridgeDepositApi.mixerSizes} value={item} onChange={setItem} />
      )}
      <SpaceBox height={16} />
      <MixerButton
        disabled={disabledDepositButton}
        onClick={() => {
          setShowDepositModal(true);
        }}
        label={'Deposit'}
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
        />
      </Modal>
    </DepositWrapper>
  );
};
