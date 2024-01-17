import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import Image from 'next/image';
import { type FC } from 'react';

export type GitHubAvatarProps = {
  name: string;
  avatarUrl: string;
  profileUrl: string;
  /**
   * The avatar size, possible values: `md` (24px), `lg` (32px)
   * @default "md"
   */
  size?: 'md' | 'lg';
};

const GitHubAvatar: FC<GitHubAvatarProps> = ({
  name,
  avatarUrl,
  profileUrl,
  size = 'md',
}) => {
  const size_ = size === 'lg' ? 32 : 24;

  return (
    <Tooltip>
      <TooltipTrigger>
        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
          <Image
            src={avatarUrl}
            alt={name}
            width={size_}
            height={size_}
            className="rounded-full"
          />
        </a>
      </TooltipTrigger>
      <TooltipBody>{name}</TooltipBody>
    </Tooltip>
  );
};

export default GitHubAvatar;
