import { DeriveSessionProgress } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';

import { Payout } from '../../types';
export interface PayoutTableProps {
  data?: Payout[];
  pageSize: number;
  updateData: (data: Payout[]) => void;
  sessionProgress: DeriveSessionProgress | null;
  historyDepth: BN | null;
  epochDuration: number | null;
  nativeTokenSymbol: string;
}
