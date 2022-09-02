import { Avatar, AvatarProps } from '../Avatar';

export type AvatarChildElement = ReactElement<AvatarProps, typeof Avatar>;

/**
 * Avatar stack properties
 */
export interface AvatarGroupProps {
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
  children: AvatarChildElement;
}
