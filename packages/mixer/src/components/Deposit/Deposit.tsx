import { MixerGroupItem, useMixerGroupsEntries, useMixerProvider } from '@webb-dapp/mixer';
import { DepositConfirm } from '@webb-dapp/mixer/components/DepositConfirm/DepositConfirm';
import { Currency } from '@webb-dapp/mixer/utils/currency';
import { useBalanceSelect } from '@webb-dapp/react-hooks/useBalanceSelect';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { WalletTokenInput } from '@webb-dapp/ui-components/Inputs/WalletTokenInput/WalletTokenInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { LoggerService } from '@webb-tools/app-util';
import { Asset } from '@webb-tools/sdk-mixer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { MixerButton } from '../MixerButton/MixerButton';

const DepositWrapper = styled.div``;
type DepositProps = {};
const depositLogger = LoggerService.get('Deposit');

export const Deposit: React.FC<DepositProps> = () => {
  const mixerGroupsEntries = useMixerGroupsEntries();
  const { clearAmount, token } = useBalanceSelect();
  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleSuccess = useCallback((): void => clearAmount(), [clearAmount]);
  const [selectedToken, setSelectedToken] = useState<Currency | undefined>(undefined);
  const items = useMemo(() => {
    return mixerGroupsEntries.getItemsOf(selectedToken?.currencyId ?? 0);
  }, [mixerGroupsEntries, selectedToken]);

  const [item, setItem] = useState<MixerGroupItem | undefined>(undefined);

  const { init, mixer } = useMixerProvider();

  useEffect(() => {
    init().catch();
  }, [init]);

  const params = useCallback(async () => {
    // ensure that this must be checked by isDisabled
    if (!token.token || typeof token.amount === 'undefined') return [];
    if (!item) {
      return [];
    }
    const groupId = item.id;
    if (!mixer) {
      depositLogger.warn(`Mixer isn't instilled yet`);
      return [];
    }
    // todo make toke symbol configurable
    const [note, leaf] = await mixer.generateNoteAndLeaf(new Asset(groupId, 'EDG'));
    return [groupId, [leaf], note.serialize()];
  }, [token, item, mixer]);

  return (
    <DepositWrapper>
      <WalletTokenInput
        setSelectedToken={setSelectedToken}
        selectedToken={selectedToken}
        mixerGroupEntriesWrapper={mixerGroupsEntries}
      />
      <SpaceBox height={16} />
      <MixerGroupSelect items={items} value={item} onChange={setItem} />
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
          params={params as any}
        />
      </Modal>
    </DepositWrapper>
  );
};
