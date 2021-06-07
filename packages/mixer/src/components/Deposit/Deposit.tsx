import { useMixerGroupsEntries } from '@webb-dapp/mixer';
import { DepositConfirm } from '@webb-dapp/mixer/components/DepositConfirm/DepositConfirm';
import { useBalanceSelect } from '@webb-dapp/react-hooks/useBalanceSelect';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { LoggerService } from '@webb-tools/app-util';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { MixerButton } from '../MixerButton/MixerButton';
import { useDeposit } from '@webb-dapp/mixer/hooks/deposit/useDeposit';
import { MixerSize } from '@webb-dapp/react-environment/webb-context';

const DepositWrapper = styled.div``;
type DepositProps = {};
const depositLogger = LoggerService.get('Deposit');

export const Deposit: React.FC<DepositProps> = () => {
  const depositApi = useDeposit();
  // const { clearAmount, token } = useBalanceSelect();
  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleSuccess = useCallback((): void => {}, []);
  // const [selectedToken, setSelectedToken] = useState<Currency | undefined>(undefined);

  const [item, setItem] = useState<MixerSize | undefined>(undefined);

  return (
    <DepositWrapper>
      {/*      <WalletTokenInput
        setSelectedToken={setSelectedToken}
        selectedToken={selectedToken}
        mixerGroupEntriesWrapper={mixerGroupsEntries}
      />*/}
      <SpaceBox height={16} />

      <MixerGroupSelect items={depositApi.mixerSizes} value={item} onChange={setItem} />
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
          provider={depositApi}
          mixerId={item?.id ?? 0}
        />
      </Modal>
    </DepositWrapper>
  );
};
