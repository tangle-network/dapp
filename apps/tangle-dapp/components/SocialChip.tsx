import { DiscordFill, GlobalLine, Mail, TwitterFill } from '@webb-tools/icons';
import { Chip } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

const SocialChip: FC<{
  href: string;
  type: 'twitter' | 'discord' | 'email' | 'web';
}> = ({ href, type }) => {
  const Icon =
    type === 'twitter'
      ? TwitterFill
      : type === 'discord'
        ? DiscordFill
        : type === 'email'
          ? Mail
          : GlobalLine;

  return (
    <a target="_blank" rel="noopener noreferrer" href={href}>
      <Chip color="dark-grey" className="hover:!bg-mono-120 py-1 px-2">
        <Icon className="fill-mono-0" size="md" />
      </Chip>
    </a>
  );
};

export default SocialChip;
