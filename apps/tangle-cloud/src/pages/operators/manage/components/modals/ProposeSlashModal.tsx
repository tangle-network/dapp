import { ProposableService } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@tangle-network/ui-components';

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
              <Typography variant="body2" className="text-mono-100">
                Loading eligible services...
              </Typography>
            ) : null}

            {!loadingProposableServices && proposableServicesCount === 0 ? (
              <Typography variant="body2" className="text-mono-100">
                No active services where your account appears as service or
                blueprint owner.
              </Typography>
            ) : null}

            {proposableServicesCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Typography variant="body3" className="mb-1">
                    Service
                  </Typography>
                  <select
                    className="w-full rounded-lg border border-mono-60 dark:border-mono-140 px-3 py-2 bg-mono-0 dark:bg-mono-200"
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
                  <Typography variant="body3" className="mb-1">
                    Operator
                  </Typography>
                  <select
                    className="w-full rounded-lg border border-mono-60 dark:border-mono-140 px-3 py-2 bg-mono-0 dark:bg-mono-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <Typography variant="body3" className="mb-1">
                    Slash BPS (1 - 10000)
                  </Typography>
                  <Input
                    id="propose-slash-bps"
                    isControlled
                    value={proposeSlashBps}
                    onChange={setProposeSlashBps}
                    placeholder="e.g. 500 (5%)"
                  />
                </div>

                <div>
                  <Typography variant="body3" className="mb-1">
                    Evidence (text or bytes32 hex)
                  </Typography>
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
              <Typography variant="body3" className="!text-red-60">
                {proposeValidationError}
              </Typography>
            ) : null}

            {errorMessage ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 space-y-2">
                <Typography
                  variant="body3"
                  className="!text-red-70 dark:!text-red-50"
                >
                  {errorMessage}
                </Typography>
                <div>
                  <button
                    type="button"
                    className="text-xs underline text-red-70 dark:text-red-50"
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
