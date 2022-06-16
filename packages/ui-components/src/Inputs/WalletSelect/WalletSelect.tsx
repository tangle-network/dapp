import { Avatar, Typography } from '@material-ui/core';
import { ManagedWallet } from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment';
import { useNativeCurrencyBalance, useNativeCurrencySymbol } from '@webb-dapp/react-hooks/currency';
import { useAccounts } from '@webb-dapp/react-hooks/useAccounts';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { useWallets } from '@webb-dapp/react-hooks/useWallets';
import { ArrowDownIcon } from '@webb-dapp/ui-components/assets/ArrowDownIcon';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { DownIconWrapper, NetworkIndicatorWrapper } from '@webb-dapp/ui-components/NetworkManger/NetworkManager';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { getRoundedAmountString } from '../../';
import { WalletManager } from './WalletManager';

const WalletSelectWrapper = styled(NetworkIndicatorWrapper)`
  && {
    margin: 0;
    width: 196px;

    ${above.xs`
      margin: 0; 
      width: 204px;
  `}
  }

  .select-wallet-button {
    display: flex;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
    color: ${({ theme }) => theme.primaryText};
  }
`;

const WalletContentWrapper = styled(Flex).attrs({
  row: true,
  flex: 1,
})``;

const ellipsisText = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AccountBalance = styled(Typography)`
  && {
    display: block;
    max-width: 28px;
    ${ellipsisText}
    margin-right: 2px;
  }
`;

const AccountAddress = styled(Typography)`
  display: block;
  color: ${({ theme }) => theme.secondaryText};
  max-width: 80px;
  ${ellipsisText}

  && {
    margin-left: 8px;
  }
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

  const [selectedWallet, setSelectedWallet] = useState<ManagedWallet | null>(null);
  const { active: selectedAccount } = useAccounts();
  const { activeChain } = useWebContext();
  const palette = useColorPallet();

  useEffect(() => {
    const nextWallet = wallets.find(({ connected }) => connected);
    if (nextWallet) {
      setSelectedWallet(nextWallet);
    }
  }, [wallets, setSelectedWallet]);

  const amountBalance = getRoundedAmountString(Number(useNativeCurrencyBalance()));
  const tokenSymbol = useNativeCurrencySymbol();

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
              <WalletContentWrapper>
                <Flex row style={{ color: palette.type === 'dark' ? palette.accentColor : palette.primaryText }}>
                  <AccountBalance color='inherit' variant='subtitle1'>
                    {amountBalance}
                  </AccountBalance>
                  <Typography color='inherit' display='block' variant='subtitle1'>
                    {tokenSymbol}
                  </Typography>
                </Flex>
                <AccountAddress variant='subtitle1'>{selectedAccount?.name || selectedAccount?.address}</AccountAddress>
              </WalletContentWrapper>

              <DownIconWrapper>
                <ArrowDownIcon />
              </DownIconWrapper>
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
