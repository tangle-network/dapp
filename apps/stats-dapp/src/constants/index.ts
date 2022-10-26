import { ExternalLink, FooterNavsType, Link, SocialConfigsType } from '../../types';
import { CommonWealth, DiscordFill, GithubFill, TelegramFill, TwitterFill } from '@nepoche/webb-ui-components/icons';

const commonExternalProps = {
  target: '_blank' as const,
};

export const logoConfig: Link = {
  name: 'Logo',
  path: '/',
};

export const webbApiConfig: ExternalLink = {
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
      href: 'https://app.webb.tools/#/bridge',
      ...commonExternalProps,
    },
    {
      name: 'wrap',
      href: 'https://app.webb.tools/#/wrap-unwrap',
      ...commonExternalProps,
    },
  ],
  network: [
    {
      name: 'statistics',
      href: 'https://www.stats-dev.webb.tools/',
      ...commonExternalProps,
    },
    {
      name: 'tangle',
      href: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fstandalone.webb.tools#/explorer',
      ...commonExternalProps,
    },
  ],
  developer: [
    {
      name: 'documentation',
      href: 'https://docs.webb.tools/v1/getting-started/overview/',
      ...commonExternalProps,
    },
    {
      name: 'source code',
      href: 'https://github.com/webb-tools',
      ...commonExternalProps,
    },
  ],
  resources: [
    {
      name: 'community',
      href: 'https://docs.webb.tools/v1/getting-started/overview/#join-the-community',
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
      href: 'https://www.webb.tools/',
      ...commonExternalProps,
    },
    {
      name: 'jobs',
      href: 'https://angel.co/company/webb-4/jobs',
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
    href: 'https://t.me/webbprotocol',
    ...commonExternalProps,
  },
  {
    name: 'discord',
    Icon: DiscordFill,
    href: 'https://discord.com/invite/cv8EfJu3Tn',
    ...commonExternalProps,
  },
  {
    name: 'twitter',
    Icon: TwitterFill,
    href: 'https://twitter.com/webbprotocol',
    ...commonExternalProps,
  },
  {
    name: 'github',
    Icon: GithubFill,
    href: 'https://github.com/webb-tools',
    ...commonExternalProps,
  },
  {
    name: 'commonwealth',
    Icon: CommonWealth,
    href: 'https://commonwealth.im/webb',
    ...commonExternalProps,
  },
];

const isDev = process.env.NODE_ENV === 'development';

export const defaultEndpoint = isDev ? 'http://localhost:4000' : 'https://subquery-dev.webb.tools/graphql';
