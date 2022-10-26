import { Avatar, Typography } from '@mui/material';
import { ManagedWallet } from '@nepoche/dapp-config';
import { useWebContext } from '@nepoche/api-provider-environment';
import { useAccounts } from '@nepoche/react-hooks/useAccounts';
import { useWallets } from '@nepoche/react-hooks/useWallets';
import { ArrowDownIcon } from '@nepoche/ui-components/assets/ArrowDownIcon';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import {
  DownIconWrapper,
  NetworkIndicatorWrapper,
} from '@nepoche/ui-components/NetworkManager/NetworkManagerIndicator';
import { useBreakpoint } from '@nepoche/responsive-utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { WalletManager } from './WalletManager';

const WalletSelectWrapper = styled(NetworkIndicatorWrapper)`
  .select-wallet-button {
    display: flex;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
    color: ${({ theme }) => theme.primaryText};
    justify-content: center;
  }
`;

const ellipsisText = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AccountAddress = styled(Typography)`
  display: block;
  color: ${({ theme }) => theme.secondaryText};
  max-width: 88px;
  ${ellipsisText}
`;

export const WalletSelect: React.FC = () => {
  const [open, setOpen] = useState(false);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  const { wallets } = useWallets();
  const { isMdOrAbove } = useBreakpoint();

  const [selectedWallet, setSelectedWallet] = useState<ManagedWallet | null>(null);
  const { active: selectedAccount } = useAccounts();
  const { activeChain } = useWebContext();

  const displayInfo = useMemo(() => {
    if (selectedWallet?.platform.includes('Substrate')) {
      const name = selectedAccount?.name.slice(0, 12) || 'Account';
      return name.length > 12 ? name.slice(0, 12) + '..' : name;
    }

    const address = selectedAccount?.address ?? '';
    const truncatedAddress = address.toLowerCase().startsWith('0x') ? address.slice(2) : address;

    return truncatedAddress.slice(0, 4).trim();
  }, [selectedAccount, selectedWallet]);

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
          openModal();
        }}
        className='select-button'
      >
        {!selectedWallet && <span className='select-wallet-button'>Select a wallet</span>}
        {selectedWallet && (
          <Flex flex={1} row ai='center' style={{ width: '100%' }}>
            <Avatar className={'avatar'} style={{ marginRight: '4px' }}>
              <selectedWallet.Logo />
            </Avatar>

            <Flex row jc='space-between' ai='center' flex={1}>
              <AccountAddress variant='subtitle1'>
                <b>{displayInfo}</b>
              </AccountAddress>

              {isMdOrAbove && (
                <DownIconWrapper>
                  <ArrowDownIcon />
                </DownIconWrapper>
              )}
            </Flex>
          </Flex>
        )}
      </WalletSelectWrapper>

      <Modal open={open} onClose={closeModal}>
        <WalletManager close={closeModal} />
      </Modal>
    </>
  );
};
