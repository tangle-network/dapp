import {
  DiscordFill,
  GithubFill,
  GlobalLine,
  Mail,
  TwitterFill,
} from '@webb-tools/icons';
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
  const Icon = getIconBySocialType(type);

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
        <Icon className="fill-mono-200 dark:fill-mono-0" size="md" />
      </Chip>
    </a>
  );
};

export default SocialChip;

function getIconBySocialType(type: SocialType) {
  switch (type) {
    case 'discord':
      return DiscordFill;
    case 'github':
      return GithubFill;
    case 'twitter':
      return TwitterFill;
    case 'website':
      return GlobalLine;
    case 'email':
      return Mail;
  }
}
