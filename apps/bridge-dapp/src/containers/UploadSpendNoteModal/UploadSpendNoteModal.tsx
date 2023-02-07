import { useWebContext } from '@webb-tools/api-provider-environment';
import { Note } from '@webb-tools/sdk-core';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  notificationApi,
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { PasteModalContent } from './PasteModalContent';
import { RefHandle, UploadSpendNoteModalProps } from './types';
import { UploadModalContent } from './UploadModalContent';

export const UploadSpendNoteModal: FC<UploadSpendNoteModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  // State for uploaded notes
  const [notes, setNotes] = useState<Record<string, Note>>({});

  // State for saving notes
  const [saving, setSaving] = useState(false);

  // Ref for reset upload file and notes
  const ref = useRef<RefHandle | null>(null);

  // Get noteManager from context
  const { noteManager } = useWebContext();

  // Handle save uploaded notes funciton
  const handleSave = useCallback(async () => {
    if (!noteManager) {
      notificationApi({
        variant: 'error',
        message: 'Note manager is not available',
        secondaryMessage:
          'Please connect to a wallet and create a note account',
      });
      return;
    }

    try {
      setSaving(true);

      await Promise.all(
        Object.entries(notes).map(([, note]) => noteManager.addNote(note))
      );

      notificationApi({
        variant: 'success',
        message: 'Notes saved successfully',
      });
    } catch (error) {
      notificationApi({
        variant: 'error',
        message: 'Failed to save notes',
      });
    } finally {
      setSaving(false);
      setIsOpen(false);
    }
  }, [noteManager, notes, setIsOpen]);

  // Handle set new note
  const handleNotesChange = useCallback((id: string, note: Note) => {
    setNotes((prevNotes) => ({ ...prevNotes, [id]: note }));
  }, []);

  // Handle remove all notes
  const handleRemoveAll = useCallback(() => {
    setNotes({});
  }, []);

  // Handle remove note by id
  const handleRemoveNote = useCallback((id: string) => {
    setNotes((prevNotes) => {
      const { [id]: _, ...rest } = prevNotes;
      return rest;
    });
  }, []);

  // useMemo to memoize the note size
  const noteSize = useMemo(() => Object.keys(notes).length, [notes]);

  return (
    <Modal open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <ModalContent
        className="rounded-xl w-[420px] bg-mono-0 dark:bg-mono-160"
        isCenter
        isOpen={isOpen}
      >
        <ModalHeader
          onClose={() => {
            setIsOpen(false);
            setNotes({});
          }}
        >
          Upload Spend Note
        </ModalHeader>

        <TabsRoot
          onValueChange={() => setNotes({})}
          defaultValue="upload"
          className="p-8 space-y-8"
        >
          <TabsList aria-label="upload-spend-note-tabs">
            <TabTrigger value="upload">Upload</TabTrigger>
            <TabTrigger value="patse">Paste</TabTrigger>
          </TabsList>

          <TabContent className="space-y-8" value="upload">
            <UploadModalContent
              ref={ref}
              onRemoveAllNotes={handleRemoveAll}
              onRemoveNote={handleRemoveNote}
              onNotesChange={handleNotesChange}
            />
          </TabContent>

          <TabContent className="space-y-2" value="patse">
            <PasteModalContent onNotesChange={handleNotesChange} />
          </TabContent>
        </TabsRoot>

        <ModalFooter>
          <Button
            loadingText="Saving..."
            isLoading={saving}
            isFullWidth
            isDisabled={!noteSize}
            onClick={handleSave}
          >
            Save
          </Button>

          {noteSize > 0 && (
            <Button
              isFullWidth
              variant="secondary"
              onClick={() => ref.current?.removeAllNotes?.()}
            >
              Back
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
