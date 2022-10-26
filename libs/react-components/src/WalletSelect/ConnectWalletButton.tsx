import { Typography } from '@mui/material';
import { useWebContext } from '@nepoche/api-provider-environment';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import React, { useCallback, useState } from 'react';
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

export const ConnectWalletButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  const { activeChain } = useWebContext();

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
        <WalletManager close={closeModal} />
      </Modal>
    </>
  );
};
