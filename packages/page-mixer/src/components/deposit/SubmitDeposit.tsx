import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
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
import CopyToClipboard from 'react-copy-to-clipboard';
import { notification } from '@webb-dapp/ui-components/notification';

function downloadString(text: string, fileType: string, fileName: string) {
  const blob = new Blob([text], { type: fileType });

  let a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
  }, 1500);
}

type SubmitDepositProps = {
  open: boolean;
  onClose(): void;
  params: () => Promise<[number, Uint8Array, string]>;
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
const SubmitDeposit: React.FC<SubmitDepositProps> = ({ open, onClose, params: getParams }) => {
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
    downloadString(note, 'plan/text', note.slice(-note.length - 10) + '.txt');
  }, [note]);
  const { executeTX, loading: depositing } = useTX({
    method: 'deposit',
    onExtrinsicSuccess: downloadNote,
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
              <Tooltip title={`Copy note the cliboard`}>
                <CopyToClipboard onCopy={handleCopy} text={note} className={'copy-button'}>
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
        <Button onClick={() => executeTX()} color='primary' disabled={loading || depositing}>
          Deposit
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
export default SubmitDeposit;
