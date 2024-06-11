import { DeriveSessionProgress } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';

import { Payout } from '../../types';
export interface PayoutTableProps {
  data?: Payout[];
  pageSize: number;
  sessionProgress: DeriveSessionProgress | null;
  historyDepth: BN | null;
  epochDuration: number | null;
}
