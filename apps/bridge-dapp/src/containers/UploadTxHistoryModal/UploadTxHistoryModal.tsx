import { type FC, useCallback, useEffect, useState } from 'react';
import type { TransactionType } from '@webb-tools/abstract-api-provider';
import { useTxClientStorage } from '@webb-tools/api-provider-environment';
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
  notificationApi,
} from '@webb-tools/webb-ui-components';
import {
  CheckboxCircleLine,
  KeyIcon,
  InformationLine,
} from '@webb-tools/icons';
import { parseJson } from '../../utils';
import { twMerge } from 'tailwind-merge';
import { txArraySchema } from './types';

const UploadTxHistoryModal: FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const { addTransactions } = useTxClientStorage();
  const [file, setFile] = useState<File | undefined>();
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isError, setIsError] = useState<boolean>(false);

  const handleUploadFile = useCallback((files: File[]) => {
    if (files.length) {
      const file = files[0];
      setFile(file);
    }
  }, []);

  const reset = useCallback(() => {
    setFile(undefined);
    setTransactions([]);
    setIsError(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    reset();
  }, [setIsOpen, reset]);

  const handleSaveTxHistory = useCallback(async () => {
    try {
      await addTransactions(transactions);
      notificationApi({
        variant: 'success',
        message: 'Transactions saved successfully',
      });
      closeModal();
    } catch (error) {
      notificationApi({
        variant: 'error',
        message: 'Error saving transactions',
        secondaryMessage:
          'Data extracted from the file might have duplicate item(s) with the existing data.',
      });
      setIsError(true);
    }
  }, [transactions, closeModal, addTransactions, notificationApi]);

  useEffect(() => {
    const processFile = async () => {
      if (!file) return;

      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = async () => {
        try {
          const text = reader.result as string;
          const [err, parsedData] = parseJson(text);
          if (err) {
            throw new Error();
          }
          const data = parsedData as TransactionType[];
          // Validate data to check if it is valid or not
          txArraySchema.parse(data);
          setTransactions(data);
          notificationApi({
            variant: 'success',
            message: 'File uploaded successfully',
          });
        } catch {
          notificationApi({
            variant: 'error',
            message: 'Invalid File',
            secondaryMessage:
              'Wrong file type or data is not in the correct format',
          });
          setIsError(true);
        }
      };
    };

    processFile();
  }, [file, notificationApi]);

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
          {file === undefined && (
            <FileUploadArea onDrop={handleUploadFile} acceptType="json" />
          )}

          {file !== undefined && (
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
                  onRemove={reset}
                />
              </FileUploadList>
              <UploadedMessage isError={isError} />
            </div>
          )}
        </div>

        <ModalFooter>
          {/* TODO: update onClick */}
          <Button
            isDisabled={file === undefined || isError}
            isFullWidth
            onClick={handleSaveTxHistory}
          >
            Save
          </Button>
          {file !== undefined && (
            <Button variant="secondary" isFullWidth onClick={reset}>
              Try Again
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadTxHistoryModal;

/** @internal */
const UploadedMessage: FC<{ isError: boolean }> = ({ isError }) => {
  return (
    <div className="flex gap-1 items-center">
      {isError ? (
        <InformationLine className="!fill-red-50" />
      ) : (
        <CheckboxCircleLine className="!fill-green-70" />
      )}
      <Typography
        variant="body4"
        className={twMerge(
          'uppercase',
          isError ? '!text-red-50' : '!text-green-70'
        )}
      >
        {isError ? 'Error' : 'Loaded File Successfully'}
      </Typography>
    </div>
  );
};
