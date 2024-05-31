import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ThreeDotsVerticalIcon } from '@webb-tools/icons/ThreeDotsVerticalIcon';
import { useNoteAccount } from '@webb-tools/react-hooks/useNoteAccount';
import type { Note } from '@webb-tools/sdk-core';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import flatten from 'lodash/flatten';
import { useCallback, useMemo, useState } from 'react';
import { downloadNotes } from '../../../utils/downloadNotes';
import ClearDataModal from './ClearDataModal';

const NoteAccountAction = () => {
  const {
    allNotes,
    hasNoteAccount,
    syncNotesProgress,
    isSyncingNote,
    syncNotes: handleSyncNotes,
    setOpenNoteAccountModal,
  } = useNoteAccount();

  // Clear data modal
  const [isOpen, setIsOpen] = useState(false);

  const { noteManager } = useWebContext();
  const { notificationApi, logger } = useWebbUI();

  const noteSize = useMemo(
    () =>
      Array.from(allNotes.values()).reduce((acc, curr) => acc + curr.length, 0),
    [allNotes],
  );

  // TODO: Implement a function when user click on the new notes link
  // on the notification
  const handleNewNotes = useCallback(
    async (notes: Note[]) => {
      logger.info(`Handle ${notes.length} new notes`);
      logger.warn('New notes function is not implemented yet');
    },
    [logger],
  );

  // Clear data function
  const handleClearData = useCallback(async () => {
    if (!noteManager) {
      notificationApi({
        variant: 'error',
        message: 'Note manager is not initialized',
      });
      return;
    }

    // Clear all notes
    try {
      await noteManager.removeAllNotes();

      notificationApi({
        variant: 'success',
        message: 'All notes are cleared',
      });
    } catch (error) {
      logger.error('Error inside clear data', error);
      notificationApi({
        variant: 'error',
        message: 'Failed to clear notes',
      });
    }
  }, [logger, noteManager, notificationApi]);

  // Save backups function
  const handleSaveBackups = useCallback(async () => {
    if (!allNotes.size) {
      notificationApi({
        variant: 'error',
        message: 'No notes to backup',
      });
      return;
    }

    downloadNotes(flatten(Array.from(allNotes.values())));
  }, [allNotes, notificationApi]);

  if (!hasNoteAccount) {
    return (
      <Button variant="utility" onClick={() => setOpenNoteAccountModal(true)}>
        Create Account
      </Button>
    );
  }

  return (
    <>
      <Button
        isLoading={isSyncingNote}
        loadingText={
          Number.isNaN(syncNotesProgress)
            ? ''
            : `${syncNotesProgress.toFixed(2)}%`
        }
        onClick={() => handleSyncNotes(handleNewNotes, handleSyncNotes)}
        variant="utility"
      >
        Sync Notes
      </Button>

      <Dropdown>
        <DropdownBasicButton className="pt-2">
          <ThreeDotsVerticalIcon size="lg" />
        </DropdownBasicButton>
        <DropdownBody className="mt-3">
          <MenuItem onClick={() => setIsOpen(true)}>Clear data</MenuItem>
        </DropdownBody>
      </Dropdown>

      <ClearDataModal
        noteSize={noteSize}
        onSaveBackups={handleSaveBackups}
        onClearData={handleClearData}
        isOpen={isOpen}
        setIsOpen={(open) => setIsOpen(open)}
      />
    </>
  );
};

export default NoteAccountAction;
