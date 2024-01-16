import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import Image from 'next/image';
import { useMemo, type FC } from 'react';

import type { GitHubAvatarProps } from './types';

const GitHubAvatar: FC<GitHubAvatarProps> = ({
  name,
  avatarUrl,
  profileUrl,
  size = 'md',
}) => {
  const _size = useMemo(() => {
    switch (size) {
      case 'md':
        return 24;
      case 'lg':
        return 32;
      default:
        return 24;
    }
  }, [size]);

  return (
    <Tooltip>
      <TooltipTrigger>
        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
          <Image
            src={avatarUrl}
            alt={name}
            width={_size}
            height={_size}
            className="rounded-full"
          />
        </a>
      </TooltipTrigger>
      <TooltipBody>{name}</TooltipBody>
    </Tooltip>
  );
};

export default GitHubAvatar;
