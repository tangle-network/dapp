import { ExternalLink, FooterNavsType, Link, SocialConfigsType } from '@webb-dapp/page-statistics/types';
import { CommonWealth, DiscordFill, GithubFill, TelegramFill, TwitterFill } from '@webb-dapp/webb-ui-components/icons';

const commonExternalProps = {
  target: '_blank' as const,
  rel: 'noopener noreferrer',
};

export const logoConfig: Link = {
  name: 'Logo',
  path: '/',
};

export const webbAppConfig: ExternalLink = {
  name: 'Webb App',
  href: 'https://app.webb.tools',
  ...commonExternalProps,
};

export const headerNavs: Link[] = [
  {
    name: 'Proposals',
    path: 'proposals',
  },
  {
    name: 'Authorities',
    path: 'authorities',
  },
  {
    name: 'Keys',
    path: 'keys',
  },
];

export const footerNavs: FooterNavsType = {
  dapp: [
    {
      name: 'bridge',
      href: '#',
      ...commonExternalProps,
    },
    {
      name: 'wrap',
      href: '#',
      ...commonExternalProps,
    },
    {
      name: 'crowdloan',
      href: '#',
      ...commonExternalProps,
    },
  ],
  network: [
    {
      name: 'statistics',
      path: '/',
    },
    {
      name: 'governance',
      href: '#',
      ...commonExternalProps,
    },
  ],
  developer: [
    {
      name: 'documentation',
      href: 'https://docs.webb.tools',
      ...commonExternalProps,
    },
    {
      name: 'source code',
      href: 'https://github.com/webb-tools/webb-dapp',
      ...commonExternalProps,
    },
    {
      name: 'whitepaper',
      href: '#',
      ...commonExternalProps,
    },
  ],
  resources: [
    {
      name: 'community',
      href: '#',
      ...commonExternalProps,
    },
    {
      name: 'FAQs',
      href: '#',
      ...commonExternalProps,
    },
  ],
  company: [
    {
      name: 'about us',
      href: '#',
      ...commonExternalProps,
    },
    {
      name: 'jobs',
      href: '#',
      ...commonExternalProps,
    },
  ],
};

export const bottomLinks: ExternalLink[] = [
  {
    name: 'Terms of Service',
    href: '#',
    ...commonExternalProps,
  },
  {
    name: 'Privacy Policy',
    href: '#',
    ...commonExternalProps,
  },
  {
    name: 'Security',
    href: '#',
    ...commonExternalProps,
  },
];

export const socialConfigs: Array<SocialConfigsType> = [
  {
    name: 'telagram',
    Icon: TelegramFill,
  },
  {
    name: 'discord',
    Icon: DiscordFill,
  },
  {
    name: 'twitter',
    Icon: TwitterFill,
  },
  {
    name: 'github',
    Icon: GithubFill,
  },
  {
    name: 'commonwealth',
    Icon: CommonWealth,
  },
];
