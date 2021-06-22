import { Avatar, ButtonBase } from '@material-ui/core';
import { SupportedWallet, supportedWallets } from '@webb-dapp/apps/configs/wallets/supported-wallets.config';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { WalletManger } from './WalletManger';
import { useWebContext } from '@webb-dapp/react-environment';

const WalletSelectWrapper = styled.div`
  box-sizing: border-box;
  .wallet-logo-wrapper {
    width: 20px;
    height: 20px;
    background: transparent;
  }

  display: inline-flex !important;
  align-items: center;
  cursor: pointer;
  min-width: 120px;
  padding: 1rem;
  height: 52px;
  max-height: 52px;
  border-radius: 32px;
  background: ${({ theme }) => theme.layer3Background} 37%;

  :hover {
    background: ${({ theme }) => theme.layer1Background} 9%;
  }

  .select-button-content {
    display: inline-block;
    margin-right: 0.2rem;
  }
`;
type WalletSelectProps = {};

type Wallet = {
  connected: boolean;
} & Omit<SupportedWallet, 'detect'>;

export const WalletSelect: React.FC<WalletSelectProps> = ({}) => {
  const [open, setOpen] = useState(false);
  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setOpen(true);
  }, []);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const { activeChain, activeWallet, switchChain } = useWebContext();
  useEffect(() => {
    const configureSelectedWallets = async () => {
      const walletsFromActiveChain = Object.values(activeChain?.wallets ?? {});
      const wallets = await Promise.all(
        walletsFromActiveChain.map(async ({ detect, ...walletConfig }) => {
          const isDetected = (await detect?.()) ?? false;
          return {
            ...walletConfig,
            enabled: isDetected,
            connected: activeWallet?.id === walletConfig.id,
          };
        })
      );
      setWallets(wallets);
    };
    configureSelectedWallets();
  }, [activeChain, activeWallet]);

  useEffect(() => {
    const nextWallet = wallets.find(({ connected }) => connected);
    if (nextWallet) {
      setSelectedWallet(nextWallet);
    }
  }, [wallets, setSelectedWallet]);
  return (
    <>
      <WalletSelectWrapper
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
        {!selectedWallet && <span className='select-button-content'>Select a wallet</span>}
        {selectedWallet && (
          <Flex row ai={'center'}>
            <Avatar className={'wallet-logo-wrapper'}>
              <selectedWallet.logo />
            </Avatar>
            <Padding x={0.3} as='span' />
            <span className='select-button-content'>{selectedWallet.title}</span>
          </Flex>
        )}
        <svg width='11' height='6' viewBox='0 0 11 6' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M5.36788 5.95672C5.50193 5.941 5.62843 5.87924 5.7302 5.77983L10.3239 1.35013C10.4005 1.2919 10.4653 1.21613 10.5141 1.12776C10.5629 1.0394 10.5945 0.940447 10.6069 0.837384C10.6193 0.734321 10.6122 0.629473 10.586 0.52971C10.5599 0.429946 10.5154 0.337516 10.4553 0.258474C10.3952 0.179433 10.3209 0.115564 10.2374 0.0710493C10.1538 0.0265349 10.0629 0.00238028 9.97045 0.000167176C9.87803 -0.00204593 9.78622 0.0177322 9.70106 0.0582068C9.6159 0.0986815 9.53931 0.15894 9.47629 0.235033L5.30637 4.25712L1.13645 0.235033C1.07343 0.158939 0.99682 0.0986811 0.911662 0.0582064C0.826503 0.0177318 0.734709 -0.00204633 0.642283 0.000166768C0.549857 0.00237987 0.458885 0.0265345 0.375335 0.0710488C0.291783 0.115563 0.21755 0.179433 0.157466 0.258474C0.0973816 0.337515 0.0527992 0.429945 0.0266752 0.529709C0.000551196 0.629473 -0.00652507 0.73432 0.00587364 0.837384C0.0182724 0.940447 0.0498828 1.0394 0.0986394 1.12776C0.147396 1.21612 0.212192 1.2919 0.288791 1.35013L4.88254 5.77983C4.94885 5.84427 5.02594 5.89312 5.1093 5.9235C5.19266 5.95388 5.28058 5.96517 5.36788 5.95672Z'
            fill='#7C7B86'
          />
        </svg>
      </WalletSelectWrapper>

      <Modal open={open} onClose={closeModal}>
        <WalletManger
          wallets={wallets}
          setSelectedWallet={async (wallet) => {
            await switchChain(activeChain, wallet);
          }}
          close={closeModal}
        />
      </Modal>
    </>
  );
};
