import type { IdentityProps } from '@polkadot/react-identicon/types';

import { IComponentBase } from '../../types';

type IdenticonPickedKeys = 'theme' | 'value';

type IdenticonBaseProps = Pick<IdentityProps, IdenticonPickedKeys>;

/**
 * Props for `Avatar` component
 */
export interface AvatarProps extends IComponentBase, IdenticonBaseProps {
  /**
   * Size of avatar, `sm`: 16px, `md`: 24px, `lg`: 48px (default: "md")
   */
  size?: 'sm' | 'md' | 'lg';

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

  /**
   * Source type for the Avatar
   * @default "address"
   * */
  sourceVariant?: 'address' | 'uri';

  tooltip?: string;
}
