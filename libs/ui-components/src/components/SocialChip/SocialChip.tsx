import {
  DiscordFill,
  GithubFill,
  GlobalLine,
  Mail,
  TwitterFill,
} from '@tangle-network/icons';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { Chip } from '../Chip';
import { PropsOf } from '../../types';

type SocialType = 'discord' | 'github' | 'twitter' | 'website' | 'email';

type SocialChipProps = PropsOf<typeof Chip> & {
  href: string;
  type: SocialType;
};

const SocialChip: FC<SocialChipProps> = ({
  href,
  type,
  className,
  ...restProps
}) => {
  return (
    <a target="_blank" rel="noopener noreferrer" href={href}>
      <Chip
        color="grey"
        {...restProps}
        className={twMerge(
          'bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.2)]',
          'hover:bg-[rgba(0,0,0,0.15)] dark:hover:bg-[rgba(255,255,255,0.3)]',
          'text-mono-200 dark:text-mono-0 px-2 py-1',
          className,
        )}
      >
        <SocialIcon type={type} />
      </Chip>
    </a>
  );
};

const SocialIcon: FC<{ type: SocialType }> = ({ type }) => {
  switch (type) {
    case 'discord':
      return (
        <DiscordFill className="fill-mono-200 dark:fill-mono-0" size="md" />
      );
    case 'github':
      return (
        <GithubFill className="fill-mono-200 dark:fill-mono-0" size="md" />
      );
    case 'twitter':
      return (
        <TwitterFill className="fill-mono-200 dark:fill-mono-0" size="md" />
      );
    case 'website':
      return (
        <GlobalLine className="fill-mono-200 dark:fill-mono-0" size="md" />
      );
    case 'email':
      return <Mail className="fill-mono-200 dark:fill-mono-0" size="md" />;
  }
};

export default SocialChip;
