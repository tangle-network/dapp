import { ChipProps } from '@webb-tools/webb-ui-components/components/Chip/types';
import { ProposalBatchStatus } from '../generated/graphql';

export function getChipColorByProposalType(
  type: ProposalBatchStatus
): ChipProps['color'] {
  switch (type) {
    case ProposalBatchStatus.Signed: {
      return 'green';
    }

    case ProposalBatchStatus.Removed: {
      return 'red';
    }

    case ProposalBatchStatus.Expired: {
      return 'yellow';
    }

    default: {
      return 'purple';
    }
  }
}
