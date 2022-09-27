import { PublicKey } from '@webb-dapp/page-statistics/provider/hooks';
import { ISubQlTime } from '@webb-dapp/page-statistics/provider/stats-provider';

export interface KeyStatusCardContainerProps {
  keyType: 'current' | 'next';
  data: PublicKey;
  now: ISubQlTime;
}
