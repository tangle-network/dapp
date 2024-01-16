import { GithubFill } from '@webb-tools/icons';
import type { IconBase } from '@webb-tools/icons/types';
import type { FC } from 'react';

export interface GitHubIconWithLinkProps extends IconBase {
  href: string;
}

const GitHubIconWithLink: FC<GitHubIconWithLinkProps> = ({
  href,
  size = 'md',
  ...props
}) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <GithubFill
        size={size}
        className="!fill-mono-200 dark:!fill-mono-0 hover:!fill-mono-120 dark:hover:!fill-mono-80"
        {...props}
      />
    </a>
  );
};

export default GitHubIconWithLink;
