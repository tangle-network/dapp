'use client';

import { ClockIcon, RotateCounterClockwiseIcon } from '@radix-ui/react-icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { WEBB_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import assert from 'assert';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { createProofGenerationUrl } from '../utils';
import RadioCard from './RadioCard';

export type RunCircuitServiceModalTriggerProps = {
  owner: string;
  repositoryName: string;

  /**
   * The unique path of the circuit file under the repository.
   * This helps identify the circuit file for which the service is being run.
   *
   * @remarks
   * This is the path of the circuit file relative to the repository root.
   *
   * If omitted, it is assumed that the user is viewing a file that is not
   * a circuit file, and thus cannot choose to run a service. The `Run Service`
   * button will be disabled in this case.
   *
   * @example
   * `apps/zk-explorer/circuits/poseidon.circom`
   */
  circuitFilePath?: string;
};

enum RadioItem {
  TrustedSetupService = 'trusted-setup-service',
  ProofGenerationService = 'proof-generation-service',
}

export const RunCircuitServiceModalTrigger: FC<
  RunCircuitServiceModalTriggerProps
> = ({ circuitFilePath, owner, repositoryName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedRadioItemId, setSelectedRadioItemId] = useState<string | null>(
    null,
  );

  const router = useRouter();

  const handleContinue = useCallback(() => {
    assert(
      circuitFilePath !== undefined,
      'Circuit file path should not be undefined if the user was able to run a service.',
    );

    if (selectedRadioItemId === RadioItem.ProofGenerationService) {
      router.push(
        createProofGenerationUrl(owner, repositoryName, circuitFilePath),
      );
    }

    // TODO: Handle other services: Trusted Setup Service.
  }, [circuitFilePath, owner, repositoryName, router, selectedRadioItemId]);

  return (
    <>
      <Button
        isDisabled={circuitFilePath === undefined}
        onClick={() => setIsOpen(true)}
        variant="secondary"
      >
        Run Service
      </Button>

      <Modal open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <ModalContent
          usePortal
          isCenter
          className="bg-mono-0 dark:bg-mono-180 rounded-xl max-w-[550px] w-full"
          isOpen={isOpen}
        >
          <ModalHeader onClose={() => setIsOpen(false)}>
            Run Circuit Service
          </ModalHeader>

          <div className="p-9 space-y-9">
            <Typography variant="body1">
              With Webb, you can easily and seamlessly run services for your
              circuits.
              <br />
              <br />
              Please choose a service for{' '}
              <code className="text-mono-0">{circuitFilePath}</code>:
            </Typography>

            <div className="space-y-6">
              <RadioCard
                isDisabled
                disabledTooltipReason="Coming soon!"
                id={RadioItem.TrustedSetupService}
                selectedRadioItem={selectedRadioItemId}
                setSelectedRadioItem={setSelectedRadioItemId}
                title="Trusted Setup Service"
                description="Ensure cryptographic integrity with our tested setups."
                tooltip="Ensure the security and privacy of your circuits with our trusted setup service."
                Icon={RotateCounterClockwiseIcon}
              />

              <RadioCard
                id={RadioItem.ProofGenerationService}
                selectedRadioItem={selectedRadioItemId}
                setSelectedRadioItem={setSelectedRadioItemId}
                title="Proof Generation Service"
                description="Generate proofs seamlessly with our zkSaaS platform."
                tooltip="Automate the generation of zero-knowledge proofs with our proof generation service."
                Icon={ClockIcon}
              />
            </div>
          </div>

          <ModalFooter>
            <Button
              onClick={handleContinue}
              isFullWidth
              isDisabled={selectedRadioItemId === null}
            >
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

export default RunCircuitServiceModalTrigger;
