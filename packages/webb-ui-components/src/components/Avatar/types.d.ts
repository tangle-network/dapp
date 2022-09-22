import type { IdentityProps } from '@polkadot/react-identicon/types';

import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

type IdenticonPickedKeys = 'theme' | 'value';

type IdenticonBaseProps = Pick<IdentityProps, IdenticonPickedKeys>;

/**
 * Props for `Avatar` component
 */
export interface AvatarProps extends WebbComponentBase, IdenticonBaseProps {
  /**
   * Size of avatar, `md`: 24px, `lg`: 48px (default: "md")
   */
  size?: 'md' | 'lg';
  /**
   * Source for avatar
   */
  src?: string;
  /**
   * Alternative text if source is unavailable
   */
  alt?: string;
  /**
   * Fallback if source image is unavailable
   */
  fallback?: string;
}
