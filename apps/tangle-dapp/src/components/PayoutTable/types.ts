import { DeriveSessionProgress } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';
import { Payout } from '@webb-tools/tangle-shared-ui/types';

export interface PayoutTableProps {
  data?: Payout[];
  pageSize: number;
  sessionProgress: DeriveSessionProgress | null;
  historyDepth: BN | null;
  epochDuration: number | null;
}
