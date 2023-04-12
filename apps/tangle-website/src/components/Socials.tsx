import { IconBase } from '@webb-tools/icons/types';
import {
  Common2Icon,
  DiscordFill,
  GithubFill,
  TelegramFill,
  TwitterFill,
} from '@webb-tools/icons';

type SocialType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href: string;
};

const socials: Array<SocialType> = [
  {
    Icon: Common2Icon,
    name: 'Commonwealth',
    href: 'https://commonwealth.im/webb',
  },
  {
    name: 'Telegram',
    Icon: TelegramFill,
    href: 'https://t.me/webbprotocol',
  },
  {
    name: 'Discord',
    Icon: DiscordFill,
    href: 'https://discord.com/invite/cv8EfJu3Tn',
  },
  {
    name: 'Twitter',
    Icon: TwitterFill,
    href: 'https://twitter.com/webbprotocol',
  },
  {
    name: 'Github',
    Icon: GithubFill,
    href: 'https://github.com/webb-tools',
  },
];

export const Socials = () => {
  return (
    <div className="flex items-center space-x-4">
      {socials.map(({ Icon, name, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-mono-200"
        >
          <Icon className="w-8 h-8 !fill-current" />
        </a>
      ))}
    </div>
  );
};
