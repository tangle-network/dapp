import {
  Common2Icon,
  DiscordFill,
  DocumentationIcon,
  TelegramFill,
  TwitterFill,
  SparklingIcon,
} from '@webb-tools/icons';
import { Typography, WebsiteCommunity } from '@webb-tools/webb-ui-components';
import { NextSeo } from 'next-seo';

const links = [
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
    name: 'Commonwealth',
    Icon: Common2Icon,
    href: 'https://commonwealth.im/webb',
    description: 'Join the conversation on Commonwealth',
  },
  {
    name: 'Twitter',
    Icon: TwitterFill,
    href: 'https://twitter.com/webbprotocol',
    description: 'Say hi on the Webb Twitter',
  },
  {
    name: 'Documentation',
    Icon: DocumentationIcon,
    href: 'https://docs.webb.tools/docs',
    description: 'Learn how it works under the hood',
  },
  {
    name: 'Incentivized Testnet',
    Icon: SparklingIcon,
    href: 'https://twitter.com/webbprotocol',
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
            className="text-center text-purple-70 block font-black"
          >
            Get involved
          </Typography>

          <Typography
            variant="mkt-h3"
            className="text-center mt-1 font-black text-mono-200"
          >
            Tangle Community
          </Typography>

          <WebsiteCommunity links={links} />
        </div>
      </section>
    </>
  );
};
