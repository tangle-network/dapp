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
import {
  Button,
  Typography,
  WebsiteCommunity,
} from '@webb-tools/webb-ui-components';
import { NextSeo } from 'next-seo';
import { ResearchAndDevelopmentSection } from '../components';

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
      <NextSeo title="Community" />

      <section className="py-[156px] flex items-center justify-center w-full bg-community_bg_texture bg-no-repeat bg-cover">
        <div className="max-w-[900px]">
          <Typography
            variant="mkt-h3"
            className="px-4 text-center font-black text-mono-200"
          >
            Get Started
          </Typography>

          <WebsiteCommunity links={links} />
        </div>
      </section>

      <ResearchAndDevelopmentSection />
    </>
  );
};

export default Community;
