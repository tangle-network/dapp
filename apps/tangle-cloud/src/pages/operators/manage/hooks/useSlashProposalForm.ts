import {
  ProposableService,
  toSlashEvidenceBytes32,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useMemo, useState } from 'react';
import { isAddress } from 'viem';

export interface UseSlashProposalFormResult {
  proposeServiceId: string;
  setProposeServiceId: (value: string) => void;
  proposeOperator: string;
  setProposeOperator: (value: string) => void;
  proposeSlashBps: string;
  setProposeSlashBps: (value: string) => void;
  proposeEvidence: string;
  setProposeEvidence: (value: string) => void;
  selectedProposableService: ProposableService | null;
  proposableServiceOptions: Array<{ value: string; label: string }>;
  evidenceNormalization: { value: `0x${string}` | null; error: string | null };
  proposeValidationError: string | null;
  canSubmitPropose: boolean;
  resetForm: () => void;
}

interface UseSlashProposalFormOptions {
  proposableServices: ProposableService[] | undefined;
  proposeStatus: 'idle' | 'pending' | 'success' | 'error';
}

const useSlashProposalForm = ({
  proposableServices,
  proposeStatus,
}: UseSlashProposalFormOptions): UseSlashProposalFormResult => {
  const [proposeServiceId, setProposeServiceId] = useState('');
  const [proposeOperator, setProposeOperator] = useState('');
  const [proposeSlashBps, setProposeSlashBps] = useState('');
  const [proposeEvidence, setProposeEvidence] = useState('');

  const selectedProposableService = useMemo(() => {
    if (!proposeServiceId) {
      return null;
    }

    return (
      (proposableServices ?? []).find(
        (service) => service.serviceId.toString() === proposeServiceId,
      ) ?? null
    );
  }, [proposableServices, proposeServiceId]);

  const proposableServiceOptions = useMemo(
    () =>
      (proposableServices ?? []).map((service) => ({
        value: service.serviceId.toString(),
        label: `Service #${service.serviceId.toString()} • ${service.blueprintName}`,
      })),
    [proposableServices],
  );

  const evidenceNormalization = useMemo(
    () => toSlashEvidenceBytes32(proposeEvidence),
    [proposeEvidence],
  );

  const proposeValidationError = useMemo(() => {
    if (!proposeServiceId) {
      return 'Select a service.';
    }

    if (!isAddress(proposeOperator)) {
      return 'Please select an operator.';
    }

    const slashBps = Number(proposeSlashBps);
    if (!Number.isInteger(slashBps) || slashBps <= 0 || slashBps > 10_000) {
      return 'Slash BPS must be an integer between 1 and 10000.';
    }

    if (evidenceNormalization.error) {
      return evidenceNormalization.error;
    }

    return null;
  }, [
    evidenceNormalization.error,
    proposeOperator,
    proposeServiceId,
    proposeSlashBps,
  ]);

  const canSubmitPropose =
    proposeValidationError === null && proposeStatus !== 'pending';

  const resetForm = () => {
    setProposeServiceId('');
    setProposeOperator('');
    setProposeSlashBps('');
    setProposeEvidence('');
  };

  return {
    proposeServiceId,
    setProposeServiceId,
    proposeOperator,
    setProposeOperator,
    proposeSlashBps,
    setProposeSlashBps,
    proposeEvidence,
    setProposeEvidence,
    selectedProposableService,
    proposableServiceOptions,
    evidenceNormalization,
    proposeValidationError,
    canSubmitPropose,
    resetForm,
  };
};

export default useSlashProposalForm;
