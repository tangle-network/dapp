import { DepositConfirm } from '@webb-dapp/mixer/components/DepositConfirm/DepositConfirm';
import { MixerSize } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { MixerButton } from '../MixerButton/MixerButton';
import { WalletBridgeCurrencyInput } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { useBridgeDeposit } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';

const DepositWrapper = styled.div``;
type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const bridgeDepositApi = useBridgeDeposit();
  const bridgeApi = useBridge();
  // const { clearAmount, token } = useBalanceSelect();
  const { depositApi } = bridgeDepositApi;
  const activeBridge = depositApi?.activeBridge;
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
  return (
    <DepositWrapper>
      <WalletBridgeCurrencyInput
        setSelectedToken={(bridgeCurrency) => {
          console.log(bridgeCurrency);
          const bridge = bridgeApi.getBridge(bridgeCurrency);
          depositApi?.setBridge(bridge);
        }}
        selectedToken={selectedBrideCurrency}
      />
      <SpaceBox height={16} />
      <MixerGroupSelect items={bridgeDepositApi.mixerSizes} value={item} onChange={setItem} />
      <SpaceBox height={16} />
      <MixerButton
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
          mixerId={item?.id ?? 0}
        />
      </Modal>
    </DepositWrapper>
  );
};
