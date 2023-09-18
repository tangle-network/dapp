import {
  Common2Icon,
  DiscordFill,
  DocumentationIcon,
  ExchangeFunds,
  ForumIcon,
  TelegramFill,
  TwitterFill,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import { Typography, WebsiteCommunity } from '@webb-tools/webb-ui-components';
import {
  BRIDGE_URL,
  SOCIAL_ICONS_RECORD,
  SOCIAL_URLS_RECORD,
  WEBB_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';
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
    href: BRIDGE_URL,
    description: 'Private multi-asset bridging made easy',
  },
  {
    name: 'Github',
    Icon: SOCIAL_ICONS_RECORD.github,
    href: SOCIAL_URLS_RECORD.github,
    description: 'Explore the source code and get involved',
  },
  {
    name: 'Documentation',
    Icon: DocumentationIcon,
    href: WEBB_DOCS_URL,
    description: 'Learn how it works under the hood',
  },
  {
    name: 'Telegram',
    Icon: SOCIAL_ICONS_RECORD.telegram,
    href: SOCIAL_URLS_RECORD.telegram,
    description: 'Have question, join us on Telegram',
  },
  {
    name: 'Discord',
    Icon: SOCIAL_ICONS_RECORD.discord,
    href: SOCIAL_URLS_RECORD.discord,
    description: 'Come chat about all things Webb',
  },
  {
    name: 'Twitter',
    Icon: SOCIAL_ICONS_RECORD.twitter,
    href: SOCIAL_URLS_RECORD.twitter,
    description: 'Say hi on the Webb Twitter',
  },
  {
    name: 'Commonwealth',
    Icon: SOCIAL_ICONS_RECORD.commonwealth,
    href: SOCIAL_URLS_RECORD.commonwealth,
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
            className="px-4 font-black text-center text-mono-200"
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
