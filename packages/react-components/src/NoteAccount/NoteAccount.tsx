import { Typography } from '@mui/material';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { NetworkIndicatorWrapper } from '@webb-dapp/ui-components/NetworkManager/NetworkManagerIndicator';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { NoteAccountDetails } from './NoteAccountDetails';

const NoteAccountWrapper = styled(NetworkIndicatorWrapper)`
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

export const NoteAccount: React.FC = () => {
  const { noteManager } = useWebContext();
  const [open, setOpen] = useState(false);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <NoteAccountWrapper
        role='button'
        onClick={() => {
          openModal();
        }}
        className='select-button'
      >
        {!noteManager && <span className='select-wallet-button'>Create a Note Account</span>}
        {noteManager && (
          <Flex flex={1} row ai='center' style={{ width: '100%' }}>
            <Typography>{noteManager.getKeypair().pubkey.toHexString().slice(0, 6).trim()}</Typography>
          </Flex>
        )}
      </NoteAccountWrapper>

      <Modal open={open} onClose={closeModal}>
        <NoteAccountDetails close={closeModal} />
      </Modal>
    </>
  );
};
