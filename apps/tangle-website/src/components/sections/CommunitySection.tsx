import { DocumentationIcon, SparklingIcon } from '@webb-tools/icons';
import { Typography, WebsiteCommunity } from '@webb-tools/webb-ui-components';
import {
  SOCIAL_ICONS_RECORD,
  SOCIAL_URLS_RECORD,
  WEBB_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';
import { NextSeo } from 'next-seo';

const links = [
  {
    name: 'Discord',
    Icon: SOCIAL_ICONS_RECORD.discord,
    href: SOCIAL_URLS_RECORD.discord,
    description: 'Come chat about all things Webb',
  },
  {
    name: 'Telegram',
    Icon: SOCIAL_ICONS_RECORD.telegram,
    href: SOCIAL_URLS_RECORD.telegram,
    description: 'Have question, join us on Telegram',
  },
  {
    name: 'Commonwealth',
    Icon: SOCIAL_ICONS_RECORD.commonwealth,
    href: SOCIAL_URLS_RECORD.commonwealth,
    description: 'Join the conversation on Commonwealth',
  },
  {
    name: 'Twitter',
    Icon: SOCIAL_ICONS_RECORD.twitter,
    href: SOCIAL_URLS_RECORD.twitter,
    description: 'Say hi on the Webb Twitter',
  },
  {
    name: 'Documentation',
    Icon: DocumentationIcon,
    href: WEBB_DOCS_URL,
    description: 'Learn how it works under the hood',
  },
  {
    name: 'Incentivized Testnet',
    Icon: SparklingIcon,
    // TODO: update href
    href: '#',
    description: 'Explore the Tangle testnet and get involved',
    linkText: 'Leaderboard',
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
            variant="mkt-small-caps"
            className="block font-black text-center text-purple-70"
          >
            Get involved
          </Typography>

          <Typography
            variant="mkt-h3"
            className="mt-1 font-black text-center text-mono-200"
          >
            Tangle Community
          </Typography>

          <WebsiteCommunity links={links} />
        </div>
      </section>
    </>
  );
};
