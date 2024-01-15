'use client';

import { ClockIcon } from '@radix-ui/react-icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { WEBB_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import { FC, useState } from 'react';
import { RadioCard } from './RadioCard';

export const RunCircuitServiceModalTrigger: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedRadioItem, setSelectedRadioItem] = useState<string | null>(
    null
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="secondary">
        Run Service
      </Button>

      <Modal open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <ModalContent
          usePortal
          isCenter
          className="bg-mono-0 dark:bg-mono-180 rounded-xl max-w-[478px] w-full"
          isOpen={isOpen}
        >
          <ModalHeader onClose={() => setIsOpen(false)}>
            Run Circuit Service
          </ModalHeader>

          <div className="p-9 space-y-9">
            <Typography variant="body1">
              With Webb, you can run below service(s) for this circom circuit.
            </Typography>

            <div className="space-y-6">
              <RadioCard
                id="trusted-setup-service"
                selectedRadioItem={selectedRadioItem}
                setSelectedRadioItem={setSelectedRadioItem}
                title="Trusted Setup Service"
                description="Ensure cryptographic integrity with our tested setups."
                tooltip="This is a tooltip"
                Icon={ClockIcon}
              />

              <RadioCard
                id="proof-generation-service"
                selectedRadioItem={selectedRadioItem}
                setSelectedRadioItem={setSelectedRadioItem}
                title="Proof Generation Service"
                description="Generate proofs seamlessly with our zkSaaS platform."
                tooltip="This is a tooltip"
                Icon={ClockIcon}
              />
            </div>
          </div>

          <ModalFooter>
            <Button isFullWidth isDisabled={selectedRadioItem === null}>
              Continue
            </Button>

            <Button
              href={WEBB_DOCS_URL}
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
    </>
  );
};
