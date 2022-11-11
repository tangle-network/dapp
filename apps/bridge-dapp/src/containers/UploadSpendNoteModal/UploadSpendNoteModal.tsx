import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';
import { UploadSpendNoteModalProps } from './types';

export const UploadSpendNoteModal: FC<UploadSpendNoteModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
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
            <TabTrigger value="patse">Patse</TabTrigger>
          </TabsList>

          <TabContent value="upload">Upload</TabContent>
          <TabContent value="patse">Patse</TabContent>
        </TabsRoot>

        <ModalFooter>
          <Button isFullWidth onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
