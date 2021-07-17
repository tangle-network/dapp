
import { useWebContext } from '@webb-dapp/react-environment';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Typography } from '@material-ui/core';
import { WalletManger, WalletOfWalletManager } from './WalletManger';

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
  const [wallets, setWallets] = useState<WalletOfWalletManager[]>([]);

  const [selectedWallet, setSelectedWallet] = useState<WalletOfWalletManager | null>(null);
  const { activeApi, inactivateApi, activeChain, activeWallet, switchChain } = useWebContext();
  useEffect(() => {
    const configureSelectedWallets = async () => {
      const walletsFromActiveChain = Object.values(activeChain?.wallets ?? {});
      const wallets = await Promise.all(
        walletsFromActiveChain.map(async ({ detect, ...walletConfig }) => {
          const isDetected = (await detect?.()) ?? false;
          const connected = activeWallet?.id === walletConfig.id && activeApi;
          if (connected) {
            return {
              ...walletConfig,
              enabled: isDetected,
              connected,
              endSession: async () => {
                if (activeApi && activeApi.endSession) {
                  await Promise.all([activeApi.endSession(), await inactivateApi()]);
                }
              },
              canEndSession: Boolean(activeApi?.capabilities?.hasSessions),
            };
          }
          return {
            ...walletConfig,
            enabled: isDetected,
            connected,
            async endSession() {},
            canEndSession: false,
          };
        })
      );
      // @ts-ignore
      setWallets(wallets);
    };
    configureSelectedWallets();
  }, [activeChain, activeWallet, activeApi]);

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
        <WalletManger
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
  )

};

