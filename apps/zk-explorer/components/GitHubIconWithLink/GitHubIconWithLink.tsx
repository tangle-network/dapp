import type { FC } from 'react';
import { GithubFill } from '@webb-tools/icons';
import type { IconBase } from '@webb-tools/icons/types';

import type { GitHubIconWithLinkProps } from './types';

const GitHubIconWithLink: FC<GitHubIconWithLinkProps> = ({
  href,
  size = 'md',
  ...props
}) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <GithubFill
        size={size}
        className="!fill-mono-0 hover:!fill-mono-80"
        {...props}
      />
    </a>
  );
};

export default GitHubIconWithLink;
