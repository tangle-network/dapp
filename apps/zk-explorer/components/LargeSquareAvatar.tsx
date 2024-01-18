import { Avatar, AvatarProps } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

const LargeSquareAvatar: FC<AvatarProps> = (props) => {
  // TODO: Temporary avatar URL, replace with user's avatar. Since the avatars can be uploaded by the user, we need to store them in the database. This means it will likely be sourced from some API route.
  return (
    <Avatar
      {...props}
      className="flex rounded-2xl dark:bg-mono-190 w-24 h-24"
      size="lg"
    />
  );
};

export default LargeSquareAvatar;
