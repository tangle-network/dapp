import { ChipProps } from '@webb-tools/webb-ui-components/components/Chip/types';

export function getChipColorByKeyType(
  type: 'Next' | 'Current' | 'Previous'
): ChipProps['color'] {
  switch (type) {
    case 'Current': {
      return 'green';
    }

    case 'Next': {
      return 'yellow';
    }

    case 'Previous': {
      return 'purple';
    }

    default: {
      throw new Error(
        'Unknow ProposalStatus inside `getChipColorByKeyType` function'
      );
    }
  }
}

export function getChipColorByKeyStatus(
  status: true | false
): ChipProps['color'] {
  switch (status) {
    case true: {
      return 'green';
    }

    case false: {
      return 'purple';
    }

    default: {
      return 'yellow';
    }
  }
}
