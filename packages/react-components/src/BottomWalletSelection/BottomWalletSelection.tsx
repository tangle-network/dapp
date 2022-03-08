import { Avatar, Typography } from '@material-ui/core';
import { useWebContext } from '@webb-dapp/react-environment';
import { ManagedWallet } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { useAccounts } from '@webb-dapp/react-hooks/useAccounts';
import { useWallets } from '@webb-dapp/react-hooks/useWallets';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { WalletManager } from '@webb-dapp/ui-components/Inputs/WalletSelect/WalletManager';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const BottomSelectionWrapper = styled.div`
  display: flex;
  flex: 1;
  max-height: 60px;
  width: 100%;
  flex-direction: row;
  cursor: pointer;
`;

const AccountName = styled.p`
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 220px;
  overflow: hidden;
`;

const WalletSelectWrapper = styled.div`
  max-height: 55px;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.layer1Background}
  cursor: pointer;
  padding: 0px 20px 0px 20px;

  .wallet-logo-wrapper {
    width: 20px;
    height: 20px;
    background: transparent;
  }

  .manage-wallet-text {
    display: flex;
    width: 100%;
    flex: 1;
    justify-content: end;
  }
`;
type WalletSelectProps = {};

//TODO Remove exported WalletSelect in new UI
export const BottomWalletSelection: React.FC<WalletSelectProps> = ({}) => {
  const [open, setOpen] = useState(false);
  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setOpen(true);
  }, []);
  const { wallets } = useWallets();

  const [selectedWallet, setSelectedWallet] = useState<ManagedWallet | null>(null);
  const { activeChain, switchChain } = useWebContext();
  const { active } = useAccounts();
  const name = useMemo(() => active?.name || active?.address || '', [active]);

  useEffect(() => {
    const nextWallet = wallets.find(({ connected }) => connected);
    if (nextWallet) {
      setSelectedWallet(nextWallet);
    }
  }, [wallets, setSelectedWallet]);
  return (
    <BottomSelectionWrapper>
      <WalletSelectWrapper
        onClick={() => {
          if (!activeChain) {
            return;
          }
          openModal();
        }}
      >
        {!selectedWallet && <span>Select a wallet</span>}
        {selectedWallet && (
          <>
            <BottomSelectionWrapper>
              <Avatar className={'wallet-logo-wrapper'}>
                <selectedWallet.logo />
              </Avatar>
              <div style={{ paddingLeft: '10px' }}>
                <AccountName>{name}</AccountName>
              </div>
            </BottomSelectionWrapper>
            <div className={'manage-wallet-text'}>
              <Typography variant='h5'>
                <b>Manage Wallet</b>
              </Typography>
            </div>
          </>
        )}
      </WalletSelectWrapper>

      <Modal open={open} onClose={closeModal}>
        <WalletManager
          wallets={wallets}
          setSelectedWallet={async (wallet) => {
            if (activeChain) {
              await switchChain(activeChain, wallet);
            }
          }}
          close={closeModal}
        />
      </Modal>
    </BottomSelectionWrapper>
  );
};
