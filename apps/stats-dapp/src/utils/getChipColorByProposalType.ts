import { ChipProps } from '@nepoche/webb-ui-components/components/Chip/types';

import { ProposalStatus } from '../generated/graphql';

export function getChipColorByProposalType(type: ProposalStatus): ChipProps['color'] {
  switch (type) {
    case ProposalStatus.Accepted: {
      return 'purple';
    }

    case ProposalStatus.Executed: {
      return 'green';
    }

    case ProposalStatus.Open: {
      return 'green';
    }

    case ProposalStatus.Rejected: {
      return 'red';
    }

    case ProposalStatus.FailedToExecute: {
      return 'red';
    }

    case ProposalStatus.Removed: {
      return 'yellow';
    }

    case ProposalStatus.Signed: {
      return 'blue';
    }

    default: {
      throw new Error('Unknow ProposalStatus inside `getChipColorByProposalType` functioni');
    }
  }
}
