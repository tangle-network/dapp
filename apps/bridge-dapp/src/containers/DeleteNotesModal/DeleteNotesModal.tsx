import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';
import { downloadNotes } from '../../utils';
import { DeleteNotesModalProps } from './types';

export const DeleteNotesModal: FC<DeleteNotesModalProps> = ({
  notes,
  setNotes,
}) => {
  const { noteManager } = useWebContext();

  const isOpen = useMemo(
    () => Array.isArray(notes) && notes.length > 0,
    [notes]
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setNotes?.(undefined);
      }
    },
    [setNotes]
  );

  const handleDownloadNotes = useCallback(() => {
    if (notes) {
      downloadNotes(notes);
      setNotes?.(undefined);
    }
  }, [notes, setNotes]);

  const handleDeleteNotes = useCallback(() => {
    if (!notes || !noteManager) {
      console.trace('No notes or note manager found');
      return;
    }

    notes.forEach((note) => noteManager.removeNote(note));
    setNotes?.(undefined);
  }, [notes, setNotes, noteManager]);

  if (!notes) {
    return null;
  }

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange}>
      <ModalContent
        className="rounded-xl w-[420px] bg-mono-0 dark:bg-mono-160"
        isCenter
        isOpen={isOpen}
      >
        <ModalHeader onClose={() => setNotes?.(undefined)}>
          Delete Note{notes.length > 1 ? 's' : ''}
        </ModalHeader>

        <div className="space-y-4 p-9">
          <Typography component="p" fw="semibold" variant="body1">
            All ({notes.length}) spend note{notes.length > 1 ? 's' : ''} that
            you have selected will be permanently deleted from local storage.
            You may want to{' '}
            <Button
              onClick={handleDownloadNotes}
              as="span"
              variant="link"
              className="inline-block"
            >
              download
            </Button>{' '}
            of these before deleting.
          </Typography>

          <Typography component="p" fw="semibold" variant="body1">
            This cannot be undone. Please ensure that you are deleting the
            correct account.
          </Typography>
        </div>

        <ModalFooter>
          <Button onClick={handleDeleteNotes} isFullWidth>
            Delete Note{notes.length > 1 ? 's' : ''}
          </Button>

          <Button onClick={handleDownloadNotes} isFullWidth variant="secondary">
            Download Note{notes.length > 1 ? 's' : ''}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
