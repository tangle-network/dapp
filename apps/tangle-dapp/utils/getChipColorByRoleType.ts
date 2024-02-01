import type { ChipColors } from '@webb-tools/webb-ui-components';

import type { RoleType } from '../types';

export default function getChipColorByRoleType(roleType: RoleType): ChipColors {
  switch (roleType) {
    case 'ZkSaaS':
      return 'blue';
    case 'Tss':
      return 'purple';
    case 'TxRelay':
      return 'green';
  }
}
