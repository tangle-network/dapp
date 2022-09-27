import { PublicKey } from '@webb-dapp/page-statistics/provider/hooks';

export interface KeyStatusCardContainerProps {
  keyType: 'current' | 'next';
  data: PublicKey;
  now: Date;
}
