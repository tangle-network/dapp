import {
  Common2Icon,
  DiscordFill,
  DocumentationIcon,
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
import { SectionDescription } from '../SectionDescription';

type LinksType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href: string;
  description: string;
};

const links: Array<LinksType> = [
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
    name: 'Discord',
    Icon: DiscordFill,
    href: 'https://discord.com/invite/cv8EfJu3Tn',
    description: 'Come chat about all things Webb',
  },
  {
    name: 'Telegram',
    Icon: TelegramFill,
    href: 'https://t.me/webbprotocol',
    description: 'Have question, join us on Telegram',
  },
  {
    Icon: Common2Icon,
    name: 'Commonwealth',
    href: 'https://commonwealth.im/webb',
    description: 'Join the conversation on Commonwealth',
  },
  {
    name: 'Twitter',
    Icon: TwitterFill,
    href: 'https://twitter.com/webbprotocol',
    description: 'Say hi on the Webb Twitter',
  },
];

export const CommunitySection = () => {
  return (
    <>
      <NextSeo title="Community" />

      <section
        className="py-[60px] w-full flex items-center justify-center"
        id="community"
      >
        <div className="max-w-[900px]">
          <Typography
            variant="label"
            className="text-center text-purple-70 uppercase block"
          >
            Get involved
          </Typography>

          <Typography variant="mkt-h2" className="text-center mt-1">
            Tangle Community
          </Typography>

          <SectionDescription className="text-center mt-[16px] px-3 lg:px-0">
            The Tangle network doubles as hub for routing cross chain messages
            and for anchoring itself as a bridge endpoint for cross chain
            zero-knowledge applications.
          </SectionDescription>

          <WebsiteCommunity links={links} />
        </div>
      </section>
    </>
  );
};
