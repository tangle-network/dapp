import { Avatar, Typography } from '@mui/material';
import { ManagedWallet } from '@nepoche/dapp-config/wallets';
import { useWebContext } from '@nepoche/api-provider-environment';
import { useAccounts } from '@nepoche/react-hooks/useAccounts';
import { useWallets } from '@nepoche/react-hooks/useWallets';
import { WalletManager } from '../WalletSelect';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import { above } from '@nepoche/responsive-utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const BottomSelectionWrapper = styled.div`
  display: flex;
  flex: 1;
  max-height: 60px;
  width: 100%;
  flex-direction: row;
  cursor: pointer;
  background: ${({ theme }) => theme.lightSelectionBackground};
`;

const AccountName = styled.p`
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 110px;
  overflow: hidden;
  color: ${({ theme }) => theme.primaryText};

  ${above.xs`
    max-width: 220px;
  `}
`;

const WalletSelectWrapper = styled.div<{ wallet: ManagedWallet | null }>`
  max-height: 55px;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.lightSelectionBackground};
  cursor: pointer;
  padding: 0px 20px;

  ${({ wallet }) => {
    if (wallet) {
      return css`
        justify-content: space-between;
      `;
    } else {
      return css`
        justify-content: center;
      `;
    }
  }}

  .select-wallet-text {
    color: ${({ theme }) => theme.primaryText};
  }

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
    color: ${({ theme }) => theme.accentColor};
  }
`;

//TODO Remove exported WalletSelect in new UI
export const BottomWalletSelection: React.FC = () => {
  const [open, setOpen] = useState(false);
  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setOpen(true);
  }, []);
  const { wallets } = useWallets();

  const [selectedWallet, setSelectedWallet] = useState<ManagedWallet | null>(null);
  const { activeChain } = useWebContext();
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
        wallet={selectedWallet}
      >
        {!selectedWallet && <p className='select-wallet-text'>Select a wallet</p>}
        {selectedWallet && (
          <>
            <BottomSelectionWrapper>
              <Avatar className={'wallet-logo-wrapper'}>
                <selectedWallet.Logo />
              </Avatar>
              <div style={{ paddingLeft: '10px' }}>
                <AccountName>{name}</AccountName>
              </div>
            </BottomSelectionWrapper>
            <div className={'manage-wallet-text'}>
              <Typography variant='subtitle1'>
                <b>Manage Wallet</b>
              </Typography>
            </div>
          </>
        )}
      </WalletSelectWrapper>

      <Modal open={open} onClose={closeModal}>
        <WalletManager close={closeModal} />
      </Modal>
    </BottomSelectionWrapper>
  );
};
