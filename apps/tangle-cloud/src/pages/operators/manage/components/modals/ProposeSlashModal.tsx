import { ProposableService } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Text,
} from './SandboxModalPrimitives';

interface ProposeSlashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadingProposableServices: boolean;
  proposableServicesCount: number;
  proposableServiceOptions: Array<{ value: string; label: string }>;
  selectedProposableService: ProposableService | null;
  proposeServiceId: string;
  setProposeServiceId: (value: string) => void;
  proposeOperator: string;
  setProposeOperator: (value: string) => void;
  proposeSlashBps: string;
  setProposeSlashBps: (value: string) => void;
  proposeEvidence: string;
  setProposeEvidence: (value: string) => void;
  proposeValidationError: string | null;
  errorMessage: string | null;
  onDismissError: () => void;
  canSubmitPropose: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
}

const ProposeSlashModal = ({
  open,
  onOpenChange,
  loadingProposableServices,
  proposableServicesCount,
  proposableServiceOptions,
  selectedProposableService,
  proposeServiceId,
  setProposeServiceId,
  proposeOperator,
  setProposeOperator,
  proposeSlashBps,
  setProposeSlashBps,
  proposeEvidence,
  setProposeEvidence,
  proposeValidationError,
  errorMessage,
  onDismissError,
  canSubmitPropose,
  isSubmitting,
  onConfirm,
}: ProposeSlashModalProps) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Create Slash Proposal</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {loadingProposableServices ? (
              <Text variant="body2" className="text-muted-foreground">
                Loading eligible services...
              </Text>
            ) : null}

            {!loadingProposableServices && proposableServicesCount === 0 ? (
              <Text variant="body2" className="text-muted-foreground">
                No active services where your account appears as service or
                blueprint owner.
              </Text>
            ) : null}

            {proposableServicesCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Text variant="body3" className="mb-1">
                    Service
                  </Text>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={proposeServiceId}
                    onChange={(event) =>
                      setProposeServiceId(event.target.value)
                    }
                  >
                    <option value="">Select service</option>
                    {proposableServiceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Text variant="body3" className="mb-1">
                    Operator
                  </Text>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    value={proposeOperator}
                    onChange={(event) => setProposeOperator(event.target.value)}
                    disabled={!selectedProposableService}
                  >
                    <option value="">
                      {selectedProposableService
                        ? 'Select operator'
                        : 'Select a service first'}
                    </option>
                    {selectedProposableService?.operatorCandidates.map(
                      (operatorAddress) => (
                        <option key={operatorAddress} value={operatorAddress}>
                          {operatorAddress}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <Text variant="body3" className="mb-1">
                    Slash BPS (1 - 10000)
                  </Text>
                  <Input
                    id="propose-slash-bps"
                    isControlled
                    value={proposeSlashBps}
                    onChange={setProposeSlashBps}
                    placeholder="e.g. 500 (5%)"
                  />
                </div>

                <div>
                  <Text variant="body3" className="mb-1">
                    Evidence (text or bytes32 hex)
                  </Text>
                  <Input
                    id="propose-evidence"
                    isControlled
                    value={proposeEvidence}
                    onChange={setProposeEvidence}
                    placeholder="ipfs://... or 0x..."
                  />
                </div>
              </div>
            ) : null}

            {proposeValidationError ? (
              <Text variant="body3" className="!text-destructive">
                {proposeValidationError}
              </Text>
            ) : null}

            {errorMessage ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 space-y-2">
                <Text variant="body3" className="!text-destructive">
                  {errorMessage}
                </Text>
                <div>
                  <button
                    type="button"
                    className="text-xs underline text-destructive"
                    onClick={onDismissError}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooterActions
          hasCloseButton
          isConfirmDisabled={!canSubmitPropose}
          isProcessing={isSubmitting}
          confirmButtonText="Submit Proposal"
          onConfirm={onConfirm}
        />
      </ModalContent>
    </Modal>
  );
};

export default ProposeSlashModal;
