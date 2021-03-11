import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Icon,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { useTX } from '@webb-dapp/react-hooks/tx/useTX';
import { notification } from '@webb-dapp/ui-components/notification';
import { downloadString } from '@webb-dapp/utils';
import React, { useCallback, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';

type SubmitDepositProps = {
  open: boolean;
  onClose(): void;
  params: () => Promise<[number, Uint8Array, string]>;
  onSuccess(): void;
};
const NoteContent = styled.span`
  font-family: monospace;
  font-size: 0.8rem;
  display: block;
  background: var(--color-gray);
  word-break: break-all;
  padding: 10px;
  margin-top: 0.3rem;
  position: relative;
  min-height: 120px;

  .copy-button {
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .download-button {
    position: absolute;
    bottom: 0;
    right: 45px;
  }
`;
const SubmitDeposit: React.FC<SubmitDepositProps> = ({ onClose, onSuccess, open, params: getParams }) => {
  const [{ loading, note, params }, setParams] = useState<{
    loading: boolean;
    params: any[];
    note: string | undefined;
  }>({
    loading: true,
    note: undefined,
    params: [],
  });
  useEffect(() => {
    let canceled = false;
    if (open) {
      if (canceled) {
        return;
      }
      setParams({
        loading: true,
        note: undefined,
        params: [],
      });
      getParams().then(([id, leaf, note]) => {
        if (canceled) {
          return;
        }
        setParams({
          loading: false,
          note,
          params: [id, leaf],
        });
      });
    } else {
      setParams({
        loading: true,
        note: undefined,
        params: [],
      });
    }
    () => (canceled = true);
  }, [open, getParams]);
  const downloadNote = useCallback(() => {
    if (!note) {
      return;
    }
    downloadString(note, note.slice(-note.length - 10) + '.txt');
  }, [note]);
  const { executeTX, loading: depositing } = useTX({
    method: 'deposit',
    onExtrinsicSuccess: onSuccess,
    onFinalize: onClose,
    params,
    section: 'mixer',
  });
  const handleCopy = useCallback((): void => {
    notification.success({
      message: `Copied the note to clipboard`,
    });
  }, []);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={'sm'}>
      <DialogTitle>Confirm depositing</DialogTitle>
      <DialogContent>
        {loading || !note ? (
          <>
            <DialogContentText>Generating note</DialogContentText>
            <LinearProgress />
          </>
        ) : (
          <>
            Generating note
            <NoteContent>
              {note}
              <Tooltip title={'Download Note'}>
                <IconButton className={'download-button'} onClick={downloadNote}>
                  <Icon>download</Icon>
                </IconButton>
              </Tooltip>
              <Tooltip title={`Copy note the clipboard`}>
                <CopyToClipboard onCopy={handleCopy} text={note} {...({ className: 'copy-button' } as any)}>
                  <IconButton>
                    <Icon>content_copy</Icon>
                  </IconButton>
                </CopyToClipboard>
              </Tooltip>
            </NoteContent>
            <Typography variant={'caption'}>
              <i>This will be download if you decided to deposit</i>
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            downloadNote();
            executeTX();
          }}
          color='primary'
          disabled={loading || depositing}
        >
          Deposit
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
export default SubmitDeposit;
