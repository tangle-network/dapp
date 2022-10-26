import type { KeyGenAuthority } from '../../provider/hooks';

import { PropsOf, WebbComponentBase } from '@nepoche/webb-ui-components/types';

export interface KeyDetailProps extends PropsOf<'div'>, WebbComponentBase {
  /**
   * If `true`, the component will render as separate page.
   * By default, the component render as it's in a drawer
   */
  isPage?: boolean;
  /**
   * The key id (uncompressed key) to get detail info to display
   */
  keyId?: string;
  /**
   * The previous key id for nagivation
   */
  previousKeyId?: string;
  /**
   * The next key id for navigation
   */
  nextKeyId?: string;
}

export type AuthorityRowType = KeyGenAuthority & { detaillUrl: string };

export type KeyDetailLocationState = Pick<KeyDetailProps, 'previousKeyId' | 'nextKeyId'> | null;

export type KeyGenAuthoredTableProps = {
  data: KeyGenAuthority[];
};
