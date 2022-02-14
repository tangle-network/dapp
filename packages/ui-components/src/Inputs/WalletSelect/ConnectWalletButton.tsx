import { Typography } from '@material-ui/core';
import { useWebContext } from '@webb-dapp/react-environment';
import { ManagedWallet } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { useWallets } from '@webb-dapp/react-hooks/useWallets';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { WalletManager } from './WalletManager';

const ConnectWalletButtonWrapper = styled.div`
  box-sizing: border-box;
  display: inline-flex !important;
  align-items: center;
  cursor: pointer;
  min-width: 140px;
  padding: 1rem;
  height: 49px;
  max-height: 52px;
  border-radius: 32px;
  background: ${({ theme }) => theme.layer3Background} 37%;

  :hover {
    background: ${({ theme }) => theme.layer1Background} 9%;
  }
`;

export const ConnectWalletButton: React.FC<{}> = () => {
  const [open, setOpen] = useState(false);
  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  const { wallets } = useWallets();
  const [selectedWallet, setSelectedWallet] = useState<ManagedWallet | null>(null);
  const { activeChain, activeWallet, switchChain } = useWebContext();

  useEffect(() => {
    const nextWallet = wallets.find(({ connected }) => connected);
    if (nextWallet) {
      setSelectedWallet(nextWallet);
    }
  }, [wallets, setSelectedWallet]);

  return (
    <>
      <ConnectWalletButtonWrapper
        role='button'
        aria-disabled={!activeChain}
        onClick={() => {
          if (!activeChain) {
            return;
          }
          openModal();
        }}
        className='select-button'
      >
        <Typography>Connect Wallet</Typography>
      </ConnectWalletButtonWrapper>

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
    </>
  );
};
