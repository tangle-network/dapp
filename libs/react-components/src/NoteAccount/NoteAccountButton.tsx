import { Typography } from '@mui/material';
import { useWebContext } from '@nepoche/api-provider-environment';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { NetworkIndicatorWrapper } from '@nepoche/ui-components/NetworkManager/NetworkManagerIndicator';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NoteAccountButtonWrapper = styled(NetworkIndicatorWrapper)`
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

export const NoteAccountButton: React.FC = () => {
  const { noteManager } = useWebContext();

  return (
    <NavLink to={'note-account'}>
      <NoteAccountButtonWrapper>
        {!noteManager && <span className='select-wallet-button'>Create a Note Account</span>}
        {noteManager && (
          <Flex flex={1} row ai='center' style={{ width: '100%' }}>
            <Typography>{noteManager.getKeypair().toString().slice(0, 8).trim()}</Typography>
          </Flex>
        )}
      </NoteAccountButtonWrapper>
    </NavLink>
  );
};
