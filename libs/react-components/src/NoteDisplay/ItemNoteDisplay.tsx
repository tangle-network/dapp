import { Icon, IconButton, Tooltip, Typography } from '@mui/material';
import { downloadString } from '@nepoche/browser-utils/download';
import { useCopyable } from '@nepoche/ui-hooks';
import { Note } from '@webb-tools/sdk-core';
import { utils } from 'ethers';
import { useCallback } from 'react';
import styled from 'styled-components';

const ItemWrapper = styled.div`
  display: flex;
  border-radius: 3px;
  padding: 0.7rem;
  position: relative;
  background: ${({ theme }) => theme.heavySelectionBackground};
  color: ${({ theme }) => theme.primaryText};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

type ItemNoteDisplayProps = {
  note: Note;
  removeNote: () => Promise<void>;
};

export const ItemNoteDisplay: React.FC<ItemNoteDisplayProps> = ({ note, removeNote }) => {
  const { copy, isCopied } = useCopyable();
  const download = () => {
    downloadString(note.serialize(), `${note.note.protocol}-${note.note.tokenSymbol}-${note.note.index}` + '.txt');
  };
  const handleCopy = useCallback((): void => {
    copy(note.serialize() ?? '');
  }, [note, copy]);

  return (
    <ItemWrapper>
      <Typography variant='h6'>
        {note.note.protocol}-{note.note.tokenSymbol}-{utils.formatUnits(note.note.amount, note.note.denomination)}
      </Typography>
      <Actions>
        <Tooltip
          sx={{
            width: '18px',
            height: '18px',
            marginLeft: '5px',
            marginRight: '5px',
          }}
          title={'Download Note'}
        >
          <IconButton
            className={'download-button'}
            onClick={() => {
              download();
            }}
          >
            <Icon>download</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip
          sx={{
            width: '18px',
            height: '18px',
            marginLeft: '5px',
            marginRight: '5px',
          }}
          title={isCopied ? `Copied` : `Copy to clipboard`}
        >
          <IconButton onClick={handleCopy} {...({ className: 'copy-button' } as any)}>
            <Icon>content_copy</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip
          sx={{
            width: '18px',
            height: '18px',
            marginLeft: '5px',
            marginRight: '5px',
          }}
          title={'Remove'}
        >
          <IconButton onClick={removeNote}>
            <Icon>close</Icon>
          </IconButton>
        </Tooltip>
      </Actions>
    </ItemWrapper>
  );
};
