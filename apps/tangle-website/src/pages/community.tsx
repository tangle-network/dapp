import {
  Common2Icon,
  DiscordFill,
  DocumentationIcon,
  ExchangeFunds,
  ForumIcon,
  GithubFill,
  TelegramFill,
  TwitterFill,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import { Button } from '@webb-tools/webb-ui-components';
import { Heading2 } from '../components';

type LinksType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href: string;
  description: string;
};

const links: Array<LinksType> = [
  {
    Icon: ExchangeFunds,
    name: 'Bridge',
    href: 'https://app.webb.tools/#/bridge',
    description: 'Private multi-asset bridging made easy',
  },
  {
    name: 'Github',
    Icon: GithubFill,
    href: 'https://github.com/webb-tools',
    description: 'Explore the source code and get involved',
  },
  {
    name: 'Documentation',
    Icon: DocumentationIcon,
    href: 'https://docs.webb.tools/docs',
    description: 'Learn how it works under the hood',
  },
  {
    name: 'Telegram',
    Icon: TelegramFill,
    href: 'https://t.me/webbprotocol',
    description: 'Have question, join us on Telegram',
  },
  {
    name: 'Discord',
    Icon: DiscordFill,
    href: 'https://discord.com/invite/cv8EfJu3Tn',
    description: 'Come chat about all things Webb',
  },
  {
    name: 'Twitter',
    Icon: TwitterFill,
    href: 'https://twitter.com/webbprotocol',
    description: 'Say hi on the Webb Twitter',
  },
  {
    Icon: Common2Icon,
    name: 'Commonwealth',
    href: 'https://commonwealth.im/webb',
    description: 'Join the conversation on Commonwealth',
  },
  {
    Icon: ForumIcon,
    name: 'Feedback',
    href: 'https://github.com/webb-tools/feedback/discussions',
    description: 'Give feedback on how we can improve',
  },
];

const Community = () => {
  return (
    <>
      <section className="py-[156px] flex items-center justify-center w-full bg-community_bg_texture bg-no-repeat bg-cover">
        <div className="max-w-[900px]">
          <Heading2 className="px-4 text-center">Get Started</Heading2>

          <div className="mt-24 grid gap-4 md:grid-cols-2 w-[358px] md:w-[736px] lg:w-[900px]">
            {links.map(({ Icon, name, href, description }) => (
              <div
                className="flex flex-col p-4 w-[358px] lg:w-[442px] bg-mono-0 rounded-lg space-y-2 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
                key={href}
              >
                <span className="flex items-center space-x-2.5">
                  <Icon className="w-8 h-8 !fill-current" />
                  <span className="card-title text-mono-200">{name}</span>
                </span>

                <span className="card-text text-mono-140">{description}</span>

                <Button variant="link" href={href} target="_blank">
                  {name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Community;
