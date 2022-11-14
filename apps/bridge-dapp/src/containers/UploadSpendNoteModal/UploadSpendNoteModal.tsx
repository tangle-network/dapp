import { Note } from '@webb-tools/sdk-core';
import {
  Button,
  FileUploadField,
  FileUploadList,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';
import { PasteModalContent } from './PasteModalContent';
import { UploadSpendNoteModalProps } from './types';
import { UploadModalContent } from './UploadModalContent';

export const UploadSpendNoteModal: FC<UploadSpendNoteModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  // State for uploaded notes
  const [notes, setNotes] = useState<Note[]>([]);

  // Handle save uploaded notes funciton
  const handleSave = useCallback(() => {
    console.log('Handle save notes');
  }, []);

  return (
    <Modal open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <ModalContent
        className="rounded-xl w-[420px] bg-mono-0 dark:bg-mono-160"
        isCenter
        isOpen={isOpen}
      >
        <ModalHeader onClose={() => setIsOpen(false)}>
          Upload Spend Note
        </ModalHeader>

        <TabsRoot defaultValue="upload" className="p-8 space-y-8">
          <TabsList aria-label="upload-spend-note-tabs">
            <TabTrigger value="upload">Upload</TabTrigger>
            <TabTrigger value="patse">Paste</TabTrigger>
          </TabsList>

          <TabContent className="space-y-8" value="upload">
            <UploadModalContent onNotesChange={(notes) => setNotes(notes)} />
          </TabContent>

          <TabContent value="patse">
            <PasteModalContent />
          </TabContent>
        </TabsRoot>

        <ModalFooter>
          <Button isFullWidth isDisabled={!notes.length} onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
