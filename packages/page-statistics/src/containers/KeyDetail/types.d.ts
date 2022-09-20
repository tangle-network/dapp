import type { KeyGenAuthority } from '@webb-dapp/page-statistics/provider/hooks';

import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export interface KeyDetailProps extends PropsOf<'div'>, WebbComponentBase {
  /**
   * If `true`, the component will render as separate page.
   * By default, the component render as it's in a drawer
   */
  isPage?: boolean;
  /**
   * The key id (uncompressed key) to get detail info to display
   */
  keyId: string;
}

export type AuthorityRowType = KeyGenAuthority & { detaillUrl: string };
