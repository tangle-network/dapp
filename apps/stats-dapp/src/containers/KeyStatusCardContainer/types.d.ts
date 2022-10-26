import { PublicKey } from '../../provider/hooks';
import { ISubQlTime } from '@nepoche/dapp-types';

export interface KeyStatusCardContainerProps {
  keyType: 'current' | 'next';
  data?: PublicKey;
  now: ISubQlTime;
}
