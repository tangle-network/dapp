import { Avatar } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

export const LargeSquareAvatar: FC = () => {
  // TODO: Temporary avatar URL, replace with user's avatar. Since the avatars can be uploaded by the user, we need to store them in the database. This means it will likely be sourced from some API route.
  return (
    <Avatar
      className="flex ml-auto rounded-2xl dark:bg-mono-190 w-24 h-24"
      size="lg"
      src="./avatar.png"
    />
  );
};
