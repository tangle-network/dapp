import {
  SlashProposal,
  SlashStatus,
  getSlashActionPermissions,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { QueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Address, Hash } from 'viem';
import { SlashingTab } from '../constants';
import { sleep } from '../utils';

interface SlashSyncTarget {
  slashId: bigint;
  status: SlashStatus;
  disputeReason?: string | null;
  cancelReason?: string | null;
}

type SlashActionKey = 'propose' | 'dispute' | 'cancel' | 'execute';

type SlashActionErrorState = Record<SlashActionKey, string | null>;

interface UseSlashActionsParams {
  address?: Address;
  nowUnixSeconds: number;
  queryClient: QueryClient;
  refetchSlashProposals: () => Promise<{ data: SlashProposal[] | undefined }>;
  refetchExecutableSlashes: () => Promise<unknown>;
  proposeSlash: (
    serviceId: bigint,
    operator: Address,
    slashBps: number,
    evidence: `0x${string}`,
  ) => Promise<{ slashId?: bigint; proposal?: SlashProposal } | null>;
  disputeSlash: (slashId: bigint, reason: string) => Promise<Hash | null>;
  cancelSlash: (slashId: bigint, reason: string) => Promise<Hash | null>;
  executeSlash: (slashId: bigint) => Promise<Hash | null>;
  executableSlashIdSet: Set<string>;
  selectedSlash: SlashProposal | null;
  canSubmitDispute: boolean;
  canSubmitCancel: boolean;
  trimmedDisputeReason: string;
  trimmedCancelReason: string;
  canSubmitPropose: boolean;
  proposeServiceId: string;
  proposeOperator: string;
  proposeSlashBps: string;
  evidenceValue: `0x${string}` | null;
  resetProposeForm: () => void;
  setSelectedSlashingTab: (tab: SlashingTab) => void;
  setShowProposeModal: (open: boolean) => void;
  setShowDisputeModal: (open: boolean) => void;
  setShowCancelModal: (open: boolean) => void;
  setSelectedSlash: (slash: SlashProposal | null) => void;
  setDisputeReason: (value: string) => void;
  setCancelReason: (value: string) => void;
}

export interface UseSlashActionsResult {
  actionError: SlashActionErrorState;
  clearActionError: (key: SlashActionKey) => void;
  clearAllActionErrors: () => void;
  handleProposeSlash: () => Promise<void>;
  handleDispute: () => Promise<void>;
  handleCancel: () => Promise<void>;
  handleExecuteSingle: (slash: SlashProposal) => Promise<void>;
}

const EMPTY_ACTION_ERRORS: SlashActionErrorState = {
  propose: null,
  dispute: null,
  cancel: null,
  execute: null,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const useSlashActions = ({
  address,
  nowUnixSeconds,
  queryClient,
  refetchSlashProposals,
  refetchExecutableSlashes,
  proposeSlash,
  disputeSlash,
  cancelSlash,
  executeSlash,
  executableSlashIdSet,
  selectedSlash,
  canSubmitDispute,
  canSubmitCancel,
  trimmedDisputeReason,
  trimmedCancelReason,
  canSubmitPropose,
  proposeServiceId,
  proposeOperator,
  proposeSlashBps,
  evidenceValue,
  resetProposeForm,
  setSelectedSlashingTab,
  setShowProposeModal,
  setShowDisputeModal,
  setShowCancelModal,
  setSelectedSlash,
  setDisputeReason,
  setCancelReason,
}: UseSlashActionsParams): UseSlashActionsResult => {
  const [actionError, setActionError] =
    useState<SlashActionErrorState>(EMPTY_ACTION_ERRORS);

  const clearActionError = useCallback((key: SlashActionKey) => {
    setActionError((prev) => ({ ...prev, [key]: null }));
  }, []);

  const clearAllActionErrors = useCallback(() => {
    setActionError(EMPTY_ACTION_ERRORS);
  }, []);

  const patchSlashInCache = useCallback(
    (slashId: bigint, updater: (proposal: SlashProposal) => SlashProposal) => {
      queryClient.setQueriesData<SlashProposal[]>(
        { queryKey: ['slashing', 'proposals'] },
        (existingProposals) => {
          if (!existingProposals) {
            return existingProposals;
          }

          return existingProposals.map((proposal) =>
            proposal.id === slashId ? updater(proposal) : proposal,
          );
        },
      );
    },
    [queryClient],
  );

  const upsertSlashInCache = useCallback(
    (slash: SlashProposal) => {
      queryClient.setQueriesData<SlashProposal[]>(
        { queryKey: ['slashing', 'proposals'] },
        (existingProposals) => {
          if (!existingProposals) {
            return [slash];
          }

          const index = existingProposals.findIndex(
            (proposal) => proposal.id === slash.id,
          );

          if (index === -1) {
            return [slash, ...existingProposals];
          }

          const next = [...existingProposals];
          next[index] = slash;
          return next;
        },
      );
    },
    [queryClient],
  );

  const refreshSlashingData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['slashing'] });
    await refetchSlashProposals();
    await refetchExecutableSlashes();
  }, [queryClient, refetchExecutableSlashes, refetchSlashProposals]);

  const applySlashSyncTargetToCache = useCallback(
    (target: SlashSyncTarget) => {
      patchSlashInCache(target.slashId, (proposal) => ({
        ...proposal,
        status: target.status,
        disputeReason:
          target.disputeReason !== undefined
            ? target.disputeReason
            : proposal.disputeReason,
        cancelReason:
          target.cancelReason !== undefined
            ? target.cancelReason
            : proposal.cancelReason,
      }));
    },
    [patchSlashInCache],
  );

  const waitForSlashStatusSync = useCallback(
    async (targets: SlashSyncTarget[]) => {
      if (targets.length === 0) {
        return;
      }

      targets.forEach((target) => {
        applySlashSyncTargetToCache(target);
      });

      const matchesTarget = (
        proposal: SlashProposal | undefined,
        target: SlashSyncTarget,
      ): boolean => {
        if (!proposal || proposal.status !== target.status) {
          return false;
        }

        if (target.disputeReason !== undefined) {
          if (target.disputeReason === null) {
            if (proposal.disputeReason !== null) {
              return false;
            }
          } else {
            const expectedDispute = target.disputeReason.trim();
            const actualDispute = proposal.disputeReason?.trim() ?? '';
            if (
              expectedDispute.length > 0 &&
              actualDispute !== expectedDispute
            ) {
              return false;
            }
          }
        }

        if (target.cancelReason !== undefined) {
          if (target.cancelReason === null) {
            if (proposal.cancelReason !== null) {
              return false;
            }
          } else {
            const expectedCancel = target.cancelReason.trim();
            const actualCancel = proposal.cancelReason?.trim() ?? '';
            if (expectedCancel.length > 0 && actualCancel !== expectedCancel) {
              return false;
            }
          }
        }

        return true;
      };

      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const refreshed = await refetchSlashProposals();
          const refreshedProposals = refreshed.data ?? [];
          const allSynced = targets.every((target) => {
            const proposal = refreshedProposals.find(
              (item) => item.id === target.slashId,
            );
            return matchesTarget(proposal, target);
          });

          if (allSynced) {
            break;
          }
        } catch {
          // Keep optimistic cache values while waiting for indexer recovery.
        }

        targets.forEach((target) => {
          applySlashSyncTargetToCache(target);
        });

        await sleep(1_000);
      }

      await refetchExecutableSlashes();
    },
    [
      applySlashSyncTargetToCache,
      refetchExecutableSlashes,
      refetchSlashProposals,
    ],
  );

  const handleProposeSlash = useCallback(async () => {
    clearActionError('propose');

    if (!canSubmitPropose || !evidenceValue) {
      return;
    }

    try {
      const proposalStartedAt = BigInt(Math.floor(Date.now() / 1000));
      const slashBps = Number(proposeSlashBps);
      const operatorAddress = proposeOperator as Address;
      const targetServiceId = BigInt(proposeServiceId);
      const targetEvidence = evidenceValue.toLowerCase();
      const proposerAddress = address?.toLowerCase() ?? null;

      const result = await proposeSlash(
        targetServiceId,
        operatorAddress,
        slashBps,
        evidenceValue,
      );

      if (!result) {
        return;
      }

      if (result.proposal) {
        upsertSlashInCache(result.proposal);
      }

      resetProposeForm();
      setShowProposeModal(false);
      setSelectedSlashingTab(SlashingTab.MY_PROPOSALS);
      await refreshSlashingData();

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const refreshed = await refetchSlashProposals();
        const isVisible = (refreshed.data ?? []).some((proposal) => {
          if (result.slashId !== undefined) {
            return proposal.id === result.slashId;
          }

          return (
            proposerAddress !== null &&
            proposal.proposer.toLowerCase() === proposerAddress &&
            proposal.serviceId === targetServiceId &&
            proposal.operator.toLowerCase() === operatorAddress.toLowerCase() &&
            proposal.slashBps === BigInt(slashBps) &&
            proposal.evidence.toLowerCase() === targetEvidence &&
            proposal.proposedAt >= proposalStartedAt - BigInt(5)
          );
        });

        if (isVisible) {
          break;
        }

        await sleep(1_000);
      }
    } catch (error) {
      setActionError((prev) => ({
        ...prev,
        propose: getErrorMessage(error, 'Failed to submit slash proposal.'),
      }));
    }
  }, [
    address,
    canSubmitPropose,
    clearActionError,
    evidenceValue,
    proposeOperator,
    proposeServiceId,
    proposeSlash,
    proposeSlashBps,
    refetchSlashProposals,
    refreshSlashingData,
    resetProposeForm,
    setSelectedSlashingTab,
    setShowProposeModal,
    upsertSlashInCache,
  ]);

  const handleDispute = useCallback(async () => {
    clearActionError('dispute');

    if (!selectedSlash || !canSubmitDispute) {
      return;
    }

    try {
      const disputedSlashId = selectedSlash.id;
      const submittedDisputeReason = trimmedDisputeReason;
      const result = await disputeSlash(
        disputedSlashId,
        submittedDisputeReason,
      );

      if (!result) {
        return;
      }

      setShowDisputeModal(false);
      setSelectedSlash(null);
      setDisputeReason('');
      await waitForSlashStatusSync([
        {
          slashId: disputedSlashId,
          status: 'Disputed',
          disputeReason: submittedDisputeReason,
        },
      ]);
    } catch (error) {
      setActionError((prev) => ({
        ...prev,
        dispute: getErrorMessage(error, 'Failed to dispute slash proposal.'),
      }));
    }
  }, [
    canSubmitDispute,
    clearActionError,
    disputeSlash,
    selectedSlash,
    setDisputeReason,
    setSelectedSlash,
    setShowDisputeModal,
    trimmedDisputeReason,
    waitForSlashStatusSync,
  ]);

  const handleCancel = useCallback(async () => {
    clearActionError('cancel');

    if (!selectedSlash || !canSubmitCancel) {
      return;
    }

    try {
      const cancelledSlashId = selectedSlash.id;
      const submittedCancelReason = trimmedCancelReason;
      const result = await cancelSlash(cancelledSlashId, submittedCancelReason);

      if (!result) {
        return;
      }

      setShowCancelModal(false);
      setSelectedSlash(null);
      setCancelReason('');
      await waitForSlashStatusSync([
        {
          slashId: cancelledSlashId,
          status: 'Cancelled',
          cancelReason: submittedCancelReason,
        },
      ]);
    } catch (error) {
      setActionError((prev) => ({
        ...prev,
        cancel: getErrorMessage(error, 'Failed to cancel slash proposal.'),
      }));
    }
  }, [
    cancelSlash,
    canSubmitCancel,
    clearActionError,
    selectedSlash,
    setCancelReason,
    setSelectedSlash,
    setShowCancelModal,
    trimmedCancelReason,
    waitForSlashStatusSync,
  ]);

  const handleExecuteSingle = useCallback(
    async (slash: SlashProposal) => {
      clearActionError('execute');

      try {
        const permissions = getSlashActionPermissions({
          slash,
          connectedAddress: address,
          nowUnixSeconds,
        });
        const isExecutable = executableSlashIdSet.has(slash.id.toString());

        if (!permissions.canExecute || !isExecutable) {
          return;
        }

        const result = await executeSlash(slash.id);
        if (!result) {
          return;
        }

        await waitForSlashStatusSync([
          {
            slashId: slash.id,
            status: 'Executed',
          },
        ]);
      } catch (error) {
        setActionError((prev) => ({
          ...prev,
          execute: getErrorMessage(error, 'Failed to execute slash proposal.'),
        }));
      }
    },
    [
      address,
      clearActionError,
      executableSlashIdSet,
      executeSlash,
      nowUnixSeconds,
      waitForSlashStatusSync,
    ],
  );

  return {
    actionError,
    clearActionError,
    clearAllActionErrors,
    handleProposeSlash,
    handleDispute,
    handleCancel,
    handleExecuteSingle,
  };
};

export default useSlashActions;
