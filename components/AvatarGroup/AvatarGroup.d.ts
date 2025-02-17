import { AvatarGroupProps } from './types';
/**
 * Avatar Group - Use to display stacked avatar list
 *
 * Props:
 *
 * - `max`: Max avatars to show before +n (default: `3`)
 * - `total`: The total number of avatars. Used for calculating the number of extra avatars (default: `children.length`)
 * - `children`: Must be a list of `Avatar` components
 *
 * @example
 *
 * ```jsx
 *  <AvatarGroup max={3}>
 *    <Avatar alt="Authority1" src="/static/images/avatar/1.jpg" />
 *    <Avatar alt="Authority2" src="/static/images/avatar/2.jpg" />
 *    <Avatar alt="Authority3" src="/static/images/avatar/3.jpg" />
 *  </AvatarGroup>
 * ```
 */
export declare const AvatarGroup: import('../../../../../node_modules/react').ForwardRefExoticComponent<AvatarGroupProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
