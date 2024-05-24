import { ChipColors } from '@webb-tools/webb-ui-components';
import { ProposalBatchStatus, ProposalType } from '../../generated/graphql';

export const PROPOSAL_TYPES: ProposalType[] = [
  ProposalType.AnchorCreate,
  ProposalType.AnchorUpdate,
  ProposalType.Evm,
  ProposalType.FeeRecipientUpdate,
  ProposalType.MaxDepositLimitUpdate,
  ProposalType.MinWithdrawalLimitUpdate,
  ProposalType.Refresh,
  ProposalType.RescueTokens,
  ProposalType.ResourceIdUpdate,
  ProposalType.ResourceIdUpdate,
  ProposalType.SetTreasuryHandler,
  ProposalType.SetVerifier,
  ProposalType.TokenAdd,
  ProposalType.TokenRemove,
  ProposalType.WrappingFeeUpdate,
];
export const PROPOSAL_STATUS: ProposalBatchStatus[] = [
  ProposalBatchStatus.Signed,
  ProposalBatchStatus.Removed,
  ProposalBatchStatus.Expired,
];

export const mapProposalStatusToChipColor = (
  status: ProposalBatchStatus,
): ChipColors => {
  switch (status) {
    case ProposalBatchStatus.Signed:
      return 'green';
    case ProposalBatchStatus.Removed:
      return 'red';
    case ProposalBatchStatus.Expired:
      return 'yellow';
  }

  return 'purple';
};
