import type { ReactElement } from 'react';
import type { WebbComponentBase } from '../../types/index.js';
import type { Avatar, AvatarProps } from '../Avatar/index.js';

export type AvatarChildElement = ReactElement<AvatarProps, typeof Avatar>;

/**
 * Avatar stack properties
 */
export interface AvatarGroupProps extends WebbComponentBase {
  /**
   * 	Max avatars to show before +n.
   * @default 3
   */
  max?: number;
  /**
   * The total number of avatars. Used for calculating the number of extra avatars.
   * @defalut children.length
   */
  total?: number;
  /**
   * Children must be a list of Avatar components
   */
  children: AvatarChildElement[];
}
