import { DepositConfirm } from '@webb-dapp/bridge/components/DepositConfirm/DepositConfirm';
import { MixerSize, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { MixerButton } from '../MixerButton/MixerButton';
import { WalletBridgeCurrencyInput } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { useBridgeDeposit } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
import { ChainId, chainsPopulated } from '@webb-dapp/apps/configs';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';

const DepositWrapper = styled.div``;
type DepositProps = {};
const BridgeWrapper = styled.div`
  height: 200px;
  width: 200px;
  position: relative;
`;
const BridgeChain = styled.div<{ source: boolean; active: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: absolute;
  transition: all ease-in-out 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 1px 1px 5px gray;
  ${({ source, theme, active }: { source: boolean; active: boolean; theme: Pallet }) => {
    if (active) {
      return css`
        border: 1px solid ${theme.secondary};
      `;
    }
    if (source) {
      return css`
        border: 1px solid ${theme.primary};
      `;
    }
  }}
`;
const BridgeDisplay: React.FC<{
  from: ChainId | undefined;
  to: ChainId | undefined;
  chains: ChainId[];
}> = ({ chains, from, to }) => {
  if (chains.length === 0) {
    return null;
  }
  return (
    <BridgeWrapper>
      {chains.map((chainId, index) => {
        const chain = chainsPopulated[chainId];
        return (
          <BridgeChain
            source={chainId === from}
            active={chainId === to}
            style={{
              left: (400 / chains.length) * index,
              bottom: chainId === from || chainId === to ? 80 : 40,
            }}
            key={`${chainId}-bridge-chain`}
          >
            {<chain.logo />}
          </BridgeChain>
        );
      })}
    </BridgeWrapper>
  );
};
export const Deposit: React.FC<DepositProps> = () => {
  const bridgeDepositApi = useBridgeDeposit();
  // const { clearAmount, token } = useBalanceSelect();
  const { depositApi } = bridgeDepositApi;
  const activeBridge = depositApi?.activeBridge;
  const { activeChain } = useWebContext();
  const selectedBrideCurrency = useMemo(() => {
    if (!activeBridge) {
      return undefined;
    }
    return activeBridge.currency;
  }, [activeBridge]);

  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleSuccess = useCallback((): void => {}, []);
  // const [selectedToken, setSelectedToken] = useState<Currency | undefined>(undefined);

  const [item, setItem] = useState<MixerSize | undefined>(undefined);

  const [destChain, setDestChain] = useState<ChainId | undefined>(undefined);
  const tokenChains = useMemo(() => {
    return selectedBrideCurrency?.chainIds ?? [];
  }, [selectedBrideCurrency]);
  const disabledDepositButton = typeof item?.id === 'undefined' || typeof destChain === 'undefined';
  return (
    <DepositWrapper>
      <BridgeDisplay from={activeChain?.id} to={destChain} chains={tokenChains} />

      <WalletBridgeCurrencyInput
        setSelectedToken={bridgeDepositApi.setSelectedCurrency}
        selectedToken={bridgeDepositApi.selectedBrideCurrency ?? undefined}
      />
      <SpaceBox height={16} />
      <ChainInput chains={tokenChains} selectedChain={destChain} setSelectedChain={setDestChain} />
      <SpaceBox height={16} />
      <MixerGroupSelect items={bridgeDepositApi.mixerSizes} value={item} onChange={setItem} />
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
