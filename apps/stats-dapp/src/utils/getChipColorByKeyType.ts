import { ChipProps } from '@nepoche/webb-ui-components/components/Chip/types';

export function getChipColorByKeyType(type: 'Next' | 'Current' | 'Pending'): ChipProps['color'] {
  switch (type) {
    case 'Current': {
      return 'green';
    }

    case 'Next': {
      return 'blue';
    }

    case 'Pending': {
      return 'yellow';
    }

    default: {
      throw new Error('Unknow ProposalStatus inside `getChipColorByKeyType` function');
    }
  }
}
