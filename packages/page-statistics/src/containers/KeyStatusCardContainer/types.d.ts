import { PublicKeyListView } from '@webb-dapp/page-statistics/provider/hooks';
import { PropsOf } from '@webb-dapp/webb-ui-components/types';

export interface KeyStatusCardContainerProps {
  keyType: 'current' | 'next';
  data: PublicKeyListView;
}
