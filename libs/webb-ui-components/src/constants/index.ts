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

type WebbNodeInfo = {
  parachain: {
    subqueryEndpoint: string;
    providerEndpoint: string;
  };
  standalone: {
    subqueryEndpoint: string;
    providerEndpoint: string;
  };
};

export const webbNodes: WebbNodeInfo = {
  parachain: {
    subqueryEndpoint: 'https://tangle-subquery.webb.tools/graphql',
    providerEndpoint: 'wss://tangle-archive.webb.tools/',
  },
  standalone: {
    subqueryEndpoint: 'https://subquery-dev.webb.tools/graphql',
    providerEndpoint: 'wss://arana-alpha-1.webb.tools/',
  },
};

type webbApiConfigType = {
  parachain: ExternalLink;
  standalone: ExternalLink;
};

export const webbApiConfig: webbApiConfigType = {
  parachain: {
    name: 'Tangle Network',
    href: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftangle1.webb.tools#/explorer',
    ...commonExternalProps,
  },
  standalone: {
    name: 'Arana Alpha',
    href: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Farana-alpha-1.webb.tools#/explorer',
    ...commonExternalProps,
  },
};

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
    // {
    //   name: 'wrap',
    //   href: 'https://app.webb.tools/#/wrap-unwrap',
    //   ...commonExternalProps,
    // },
  ],
  network: [
    {
      name: 'statistics',
      href: 'https://stats.webb.tools/',
      ...commonExternalProps,
    },
    {
      name: 'tangle',
      href: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftangle1.webb.tools#/explorer',
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
    // {
    //   name: 'FAQs',
    //   href: '#',
    //   ...commonExternalProps,
    // },
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
  // {
  //   name: 'Security',
  //   href: '#',
  //   ...commonExternalProps,
  // },
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
