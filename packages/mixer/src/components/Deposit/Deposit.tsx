import { DepositConfirm } from '@webb-dapp/mixer/components/DepositConfirm/DepositConfirm';
import { useDeposit } from '@webb-dapp/mixer/hooks/deposit/useDeposit';
import { MixerSize } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { WalletTokenInput } from '@webb-dapp/ui-components/Inputs/WalletTokenInput/WalletTokenInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { MixerButton } from '../MixerButton/MixerButton';

const DepositWrapper = styled.div``;
type DepositProps = {};

export const Deposit: React.FC<DepositProps> = () => {
  const depositApi = useDeposit();
  // const { clearAmount, token } = useBalanceSelect();
  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleSuccess = useCallback((): void => {}, []);
  // const [selectedToken, setSelectedToken] = useState<Currency | undefined>(undefined);

  const [item, setItem] = useState<MixerSize | undefined>(undefined);

  // Whenever mixerSizes change (like chain switch), set selected mixer to undefined
  useEffect(() => {
    setItem(undefined);
  }, [depositApi.mixerSizes]);

  return (
    <DepositWrapper>
      <WalletTokenInput setSelectedToken={(token) => {}} selectedToken={undefined} />
      <SpaceBox height={16} />
      {depositApi && depositApi.mixerSizes.length > 0 && (
        <MixerGroupSelect items={depositApi.mixerSizes} value={item} onChange={setItem} />
      )}
      <SpaceBox height={16} />
      <MixerButton
        disabled={!depositApi.ready || !item}
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
          provider={depositApi}
          mixerId={item?.id ?? 0}
        />
      </Modal>
    </DepositWrapper>
  );
};
