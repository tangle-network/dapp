import { PublicKey } from '../../provider/hooks';
import { ISubQlTime } from '@webb-tools/dapp-types';

export interface KeyStatusCardContainerProps {
  keyType: 'current' | 'next';
  data?: PublicKey;
  now: ISubQlTime;
}
