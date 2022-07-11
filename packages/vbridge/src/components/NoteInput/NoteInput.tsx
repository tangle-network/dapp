import { Icon, IconButton } from '@mui/material';
import { parseChainIdType } from '@webb-dapp/api-providers/chains';
import { getChainNameFromChainId } from '@webb-dapp/api-providers/utils';
import { useDepositNote } from '@webb-dapp/mixer/hooks';
import { useAppConfig } from '@webb-dapp/react-environment/webb-context';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { BridgeNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/BridgeNoteInput';
import { useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
import { ethers } from 'ethers';

import { InformationItem, Title, Value } from '../shared/styled';
import { NoteInputProps } from './note-input-props.interface';
import { NoteInputContainer, NoteInputWrapper } from './styled';

export const NoteInput: React.FC<NoteInputProps> = ({ error, isRemoveNote = false, note, noteAction, setNote }) => {
  const { isSmOrAbove, isXsOrAbove } = useBreakpoint();
  const appConfig = useAppConfig();
  const depositNote = useDepositNote(note);

  return (
    <NoteInputContainer>
      <Flex row ai={'center'}>
        <Flex row ai='center' flex={1}>
          <IconButton style={{ marginRight: '4px' }} onClick={noteAction}>
            <Icon>{isRemoveNote ? 'remove_circle' : 'add_circle'}</Icon>
          </IconButton>
          <NoteInputWrapper>
            <BridgeNoteInput error={error} value={note} onChange={setNote} />
          </NoteInputWrapper>
        </Flex>

        {isSmOrAbove && depositNote && (
          <div style={{ flexGrow: 1, padding: '0 12px' }}>
            <InformationItem>
              <Title>
                <b>Dest Chain:</b>
              </Title>
              <Value>
                {getChainNameFromChainId(appConfig, parseChainIdType(Number(depositNote.note.targetChainId)))}
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
              {getChainNameFromChainId(appConfig, parseChainIdType(Number(depositNote.note.targetChainId)))}
            </Value>
          </InformationItem>
          <InformationItem>
            <Title>
              <b>Amount Avail:</b>
            </Title>
            <Value>
              {depositNote.note.amount} {depositNote.note.tokenSymbol}
            </Value>
          </InformationItem>
        </div>
      )}
    </NoteInputContainer>
  );
};
