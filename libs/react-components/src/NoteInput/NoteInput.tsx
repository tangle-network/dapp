import { FormHelperText, Icon, IconButton, InputBase } from '@mui/material';
import { useApiConfig, useWebContext } from '@nepoche/api-provider-environment';
import { useDepositNote } from '@nepoche/react-hooks/note';
import { InformationItem, Title, Value } from '@nepoche/ui-components';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { useBreakpoint } from '@nepoche/responsive-utils';
import { parseTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

import { NoteInputProps } from './note-input-props.interface';
import { NoteInputContainer, NoteInputWrapper } from './styled';
import { useEffect } from 'react';
import { webbCurrencyIdFromString } from '@nepoche/dapp-types';

export const NoteInput: React.FC<NoteInputProps> = ({ error, isRemoveNote = false, note, noteAction, setNote }) => {
  const { isSmOrAbove, isXsOrAbove } = useBreakpoint();
  const apiConfig = useApiConfig();
  const depositNote = useDepositNote(note);
  const { activeApi } = useWebContext();
  const bridgeApi = activeApi?.methods.bridgeApi;

  // Side effects on note input
  useEffect(() => {
    if (depositNote && bridgeApi) {
      // Set the appropriate active bridge
      const bridgedCurrencyId = webbCurrencyIdFromString(depositNote.note.tokenSymbol);
      const bridgeEntry = bridgeApi.bridges.find((entry) => {
        return entry.currency.id === bridgedCurrencyId;
      });
      if (bridgeEntry) {
        bridgeApi.setActiveBridge(bridgeEntry);
      }
    }
  }, [bridgeApi, depositNote]);

  return (
    <NoteInputContainer>
      <Flex row ai={'center'}>
        <Flex row ai='center' flex={1}>
          <IconButton style={{ marginRight: '4px' }} onClick={noteAction}>
            <Icon>{isRemoveNote ? 'remove_circle' : 'add_circle'}</Icon>
          </IconButton>
          <NoteInputWrapper>
            <InputBase
              fullWidth
              placeholder={`Please paste your note here`}
              value={note}
              inputProps={{ style: { fontSize: 14 } }}
              onChange={(event) => {
                setNote(event.target.value as string);
              }}
            />
            <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
          </NoteInputWrapper>
        </Flex>

        {isSmOrAbove && depositNote && (
          <div style={{ flexGrow: 1, padding: '0 12px' }}>
            <InformationItem>
              <Title>
                <b>Dest Chain:</b>
              </Title>
              <Value>
                {apiConfig.getChainNameFromTypedChainId(parseTypedChainId(Number(depositNote.note.targetChainId)))}
              </Value>
            </InformationItem>
            <InformationItem>
              <Title>
                <b>Amount Avail:</b>
              </Title>
              <Value>
                {ethers.utils.formatUnits(depositNote.note.amount, depositNote.note.denomination)}{' '}
                {depositNote.note.tokenSymbol}
              </Value>
            </InformationItem>
          </div>
        )}
      </Flex>
      {!isSmOrAbove && depositNote && (
        <div style={{ marginLeft: '15%', marginTop: '16px', width: isXsOrAbove ? '70%' : '80%' }}>
          <InformationItem style={{ marginBottom: '12px' }}>
            <Title>
              <b>Dest Chain:</b>
            </Title>
            <Value>
              {apiConfig.getChainNameFromTypedChainId(parseTypedChainId(Number(depositNote.note.targetChainId)))}
            </Value>
          </InformationItem>
          <InformationItem>
            <Title>
              <b>Amount Avail:</b>
            </Title>
            <Value>
              {ethers.utils.formatUnits(depositNote.note.amount, depositNote.note.denomination)}{' '}
              {depositNote.note.tokenSymbol}
            </Value>
          </InformationItem>
        </div>
      )}
    </NoteInputContainer>
  );
};
