import {
  ExternalLink,
  FooterNavsType,
  Link,
  SocialConfigsType,
} from '../types';
import {
  CommonWealth,
  DiscordFill,
  GithubFill,
  TelegramFill,
  TwitterFill,
} from '@webb-tools/icons';

/** TODO: Determine the best way to put thess configs to share across the project */
const commonExternalProps = {
  target: '_blank' as const,
};

export const logoConfig: Link = {
  name: 'Logo',
  path: '/',
};

/**
 * The network type (use to categorize the network)
 */
export type NetworkType = 'live' | 'testnet' | 'dev';

export type NetworkNodeType = 'parachain' | 'standalone';

export type Network = {
  name: string;
  networkType: NetworkType;
  networkNodeType: NetworkNodeType;
  subqueryEndpoint: string;
  polkadotEndpoint: string;
  polkadotExplorer: string;
  avatar: string;
};

export type webbNetworksType = {
  networkType: NetworkType;
  networks: Network[];
};

export const webbNetworks: webbNetworksType[] = [
  {
    networkType: 'live',
    networks: [],
  },
  {
    networkType: 'testnet',
    networks: [
      {
        name: 'Tangle Standalone',
        networkType: 'testnet',
        networkNodeType: 'standalone',
        subqueryEndpoint: 'https://standalone-subql.webb.tools/graphql',
        polkadotEndpoint: 'wss://tangle-standalone-archive.webb.tools',
        polkadotExplorer:
          'https://polkadot.js.org/apps/?rpc=wss://tangle-standalone-archive.webb.tools#/explorer',
        avatar: '',
      },
    ],
  },
  {
    networkType: 'dev',
    networks: [
      {
        name: 'Local endpoint (127.0.0.1)',
        networkType: 'dev',
        networkNodeType: 'standalone',
        subqueryEndpoint: 'http://localhost:4000/graphql',
        polkadotEndpoint: 'ws://127.0.0.1:9944',
        polkadotExplorer:
          'https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944#/explorer',
        avatar: '',
      },
    ],
  },
];

export const webbAppConfig: ExternalLink = {
  name: 'Hubble Bridge',
  href: 'https://app.webb.tools/',
  ...commonExternalProps,
};

export const headerNavs: Link[] = [
  {
    name: 'Keys',
    path: 'keys',
  },
  {
    name: 'Authorities',
    path: 'authorities',
  },
  {
    name: 'Proposals',
    path: 'proposals',
  },
];

export const footerNavs: FooterNavsType = {
  dapp: [
    {
      name: 'bridge',
      href: 'https://apps.webb.tools/',
      ...commonExternalProps,
    },
  ],
  network: [
    {
      name: 'statistics',
      href: 'https://stats.webb.tools/',
      ...commonExternalProps,
    },
    {
      name: 'tangle',
      href: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftangle-standalone-archive.webb.tools%2F#/explorer',
      ...commonExternalProps,
    },
  ],
  developer: [
    {
      name: 'documentation',
      href: 'https://docs.webb.tools/',
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
      href: 'https://t.me/webbprotocol',
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
    href: 'https://webb.tools/terms-and-conditions',
    ...commonExternalProps,
  },
  {
    name: 'Privacy Policy',
    href: 'https://webb.tools/privacy-policy',
    ...commonExternalProps,
  },
];

export const socialConfigs: Array<SocialConfigsType> = [
  {
    name: 'telegram',
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
