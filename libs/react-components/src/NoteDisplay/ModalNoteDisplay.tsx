import { Icon, IconButton, Tooltip } from '@mui/material';
import { useCopyable } from '@nepoche/ui-hooks';
import { notificationApi } from '@nepoche/ui-components/notification';
import { useCallback } from 'react';
import styled from 'styled-components';

const GeneratedNote = styled.div`
  border-radius: 10px;
  padding: 0.7rem;
  word-break: break-all;
  position: relative;
  min-height: 120px;
  background: ${({ theme }) => theme.heavySelectionBackground};
  color: ${({ theme }) => theme.primaryText};

  .copy-button {
    display: block;
  }

  .download-button {
    display: block;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

type ModalNoteDisplayProps = {
  download: () => void;
  note: string | undefined;
};

export const ModalNoteDisplay: React.FC<ModalNoteDisplayProps> = ({ download, note }) => {
  const { copy, isCopied } = useCopyable();
  const handleCopy = useCallback((): void => {
    copy(note ?? '');

    notificationApi.addToQueue({
      secondaryMessage: 'Deposit note is copied to clipboard',
      message: 'Copied  to clipboard',
      variant: 'success',
      Icon: <Icon>content_copy</Icon>,
    });
  }, [note, copy]);

  return (
    <GeneratedNote>
      {note}
      <Actions>
        <Tooltip title={'Download Note'}>
          <IconButton
            className={'download-button'}
            onClick={() => {
              download();
            }}
          >
            <Icon>download</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip title={isCopied ? `Copied` : `Copy to clipboard`}>
          <IconButton onClick={handleCopy} {...({ className: 'copy-button' } as any)}>
            <Icon>content_copy</Icon>
          </IconButton>
        </Tooltip>
      </Actions>
    </GeneratedNote>
  );
};
