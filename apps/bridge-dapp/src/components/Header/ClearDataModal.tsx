import {
  Button,
  CheckBox,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';

// TODO: Correct the learn more link here.
const LEARN_MORE_LINK = 'https://docs.webb.tools';

export const ClearDataModal: FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClearData: () => void;
  onSaveBackups: () => void;
}> = ({ isOpen, setIsOpen, onClearData, onSaveBackups }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <Modal open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <ModalContent
        isCenter
        className="bg-mono-0 dark:bg-mono-160 rounded-xl w-[420px]"
        isOpen={isOpen}
      >
        <ModalHeader onClose={() => setIsOpen(false)}>Clear Data?</ModalHeader>

        <div className="p-9 space-y-9">
          <div className="space-y-4">
            <Typography variant="body1" fw="semibold">
              All (10) spend note(s) that you have will be permenently deleted
              from local storage. You may want to{' '}
              <Button
                onClick={onSaveBackups}
                as="span"
                variant="link"
                className="inline-block"
              >
                save backups
              </Button>{' '}
              of these secret notes before deleting.
            </Typography>

            <Typography variant="body1" fw="semibold">
              This cannot be undone. Please ensure that you are deleting the
              correct account.
            </Typography>
          </div>

          <CheckBox
            isChecked={isChecked}
            onChange={() => setIsChecked((prev) => !prev)}
            wrapperClassName="items-center"
          >
            I understand this action is irreversible.
          </CheckBox>
        </div>

        <ModalFooter>
          <Button onClick={onClearData} isDisabled={!isChecked} isFullWidth>
            Confirm
          </Button>
          <Button
            href={LEARN_MORE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            isFullWidth
            variant="secondary"
          >
            Learn more
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
