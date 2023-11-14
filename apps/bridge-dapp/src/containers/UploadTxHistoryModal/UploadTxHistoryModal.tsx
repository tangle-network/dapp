import { type FC, useCallback, useState } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Typography,
  FileUploadArea,
  FileUploadItem,
  FileUploadList,
  Progress,
  getHumanFileSize,
} from '@webb-tools/webb-ui-components';
import { CheckboxCircleLine, KeyIcon } from '@webb-tools/icons';

const UploadTxHistoryModal: FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const [file, setFile] = useState<File | undefined>();

  const handleUpload = useCallback((files: File[]) => {
    if (files.length) {
      const file = files[0];
      setFile(file);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setFile(undefined);
  }, [setIsOpen]);

  return (
    <Modal open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <ModalContent
        onCloseAutoFocus={closeModal}
        isOpen={isOpen}
        className="bg-mono-0 dark:bg-mono-180 w-full md:!w-[448px] rounded-2xl"
        isCenter
      >
        <ModalHeader onClose={closeModal}>
          Upload Transaction History
        </ModalHeader>

        <div className="px-8 py-4 space-y-8">
          <FileUploadArea onDrop={handleUpload} acceptType="json" />
          {!!file && (
            <div className="space-y-2">
              <FileUploadList>
                <FileUploadItem
                  Icon={
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-mono-180">
                      <KeyIcon className="!fill-mono-0" />
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
                      <Progress className="mt-1" value={100} />
                    </>
                  }
                  onRemove={() => {
                    setFile(undefined);
                  }}
                />
              </FileUploadList>
              <div className="flex gap-1 items-center">
                <CheckboxCircleLine className="!fill-green-70" />
                <Typography
                  variant="body4"
                  className="!text-green-70 uppercase"
                >
                  Loaded File Successfully
                </Typography>
              </div>
            </div>
          )}
        </div>

        <ModalFooter>
          {/* TODO: update onClick */}
          <Button
            isDisabled={!file}
            isFullWidth
            onClick={() => {
              return;
            }}
          >
            Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadTxHistoryModal;
