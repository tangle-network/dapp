import { Key } from '@webb-tools/icons';
import { Note } from '@webb-tools/sdk-core';
import {
  Button,
  FileUploadArea,
  FileUploadItem,
  FileUploadList,
  getHumanFileSize,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  TokenPairIcons,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';
import { UploadSpendNoteModalProps } from './types';

export const UploadSpendNoteModal: FC<UploadSpendNoteModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  // State for uploaded file
  const [file, setFile] = useState<File | undefined>();

  // State for processed notes
  const [notes, setNotes] = useState<Note[]>([]);

  // State for note processing value
  const [progress, setProgress] = useState(0);

  // Handle save uploaded notes funciton
  const handleSave = useCallback(() => {
    console.log('Handle save notes');
  }, []);

  // Event handler for uploading files
  const handleUpload = useCallback((files: File[]) => {
    console.log('Handle upload', files);
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

          <TabContent className="space-y-8" value="upload">
            <FileUploadArea onDrop={handleUpload} />

            {file && (
              <FileUploadList>
                <FileUploadItem
                  Icon={
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-mono-180">
                      <Key className="!fill-mono-0" />
                    </div>
                  }
                  fileName={file.name}
                  extraInfo={
                    <>
                      <Typography
                        className="text-mono-120 dark:text-mono-80"
                        variant="body1"
                      >
                        {getHumanFileSize(file.size, true, 0)}
                      </Typography>
                      <Progress className="mt-1" value={progress} />
                    </>
                  }
                />
              </FileUploadList>
            )}

            {notes && (
              <FileUploadList title={`Available notes: ${notes.length}`}>
                {notes.map((note, idx) => {
                  console.warn(
                    'Needed to serialize note here to get the data',
                    note
                  );

                  return (
                    <FileUploadItem
                      key={idx}
                      Icon={
                        <TokenPairIcons
                          token1Symbol="WebbETH"
                          token2Symbol="weth"
                          chainName="Mumbai"
                        />
                      }
                      fileName="WebbETH/WETH"
                      extraInfo={
                        <Typography
                          className="text-mono-120 dark:text-mono-80"
                          variant="body1"
                        >
                          Note balance: 2.450
                        </Typography>
                      }
                    />
                  );
                })}
              </FileUploadList>
            )}
          </TabContent>

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
