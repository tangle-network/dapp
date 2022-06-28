import { Avatar, Typography } from '@material-ui/core';
import { ManagedWallet } from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment';
import { useAccounts } from '@webb-dapp/react-hooks/useAccounts';
import { useWallets } from '@webb-dapp/react-hooks/useWallets';
import { ArrowDownIcon } from '@webb-dapp/ui-components/assets/ArrowDownIcon';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import {
  DownIconWrapper,
  NetworkIndicatorWrapper,
} from '@webb-dapp/ui-components/NetworkManger/NetworkManagerIndicator';
import { useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
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
  ${ellipsisText}
`;

type WalletSelectProps = {};

export const WalletSelect: React.FC<WalletSelectProps> = ({}) => {
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
    if (selectedWallet?.name.toLowerCase().includes('polkadot')) {
      const name = selectedAccount?.name.slice(0, 12) || 'Account';
      return name.length > 12 ? name.slice(0, 12) + '..' : name;
    }

    const name = 'Account ';
    const address = selectedAccount?.address ?? '';
    const truncatedAddress = address.toLowerCase().startsWith('0x') ? address.slice(2) : address;

    return (name + truncatedAddress.slice(0, 4)).trim();
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
              <selectedWallet.logo />
            </Avatar>

            <Flex row jc='space-between' ai='center' flex={1}>
              <AccountAddress style={{ maxWidth: '80px' }} variant='subtitle1'>
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
