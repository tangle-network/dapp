import { Typography } from '@webb-dapp/webb-ui-components/typography';
import React, { useMemo } from 'react';

import { AvatarChildElement, AvatarGroupProps } from './types';

/**
 * Webb Avatar Group - Use to display stacked avatar list
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
export const AvatarGroup: React.FC<AvatarGroupProps> = ({ children: childrenProp, max = 3, total }) => {
  const children: AvatarChildElement[] = useMemo(() => {
    return React.Children.toArray(childrenProp).filter((child) => React.isValidElement(child));
  }, [childrenProp]);

  const totalAvatars = useMemo(() => total || children.length, [children.length, total]);

  const extraAvatars = useMemo(() => totalAvatars - max, [totalAvatars, max]);

  return (
    <div className='flex justify-center items-center space-x-1'>
      <div>
        {children.slice(0, max).map((child, index) => {
          return React.cloneElement(child, {
            ...child.props,
            size: 'md',
            className: 'mx-[-4px] last:mx-0',
          });
        })}
      </div>
      {extraAvatars > 0 && <Typography variant='body3'>+{extraAvatars} others</Typography>}
    </div>
  );
};
