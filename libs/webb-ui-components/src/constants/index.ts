import type { IconBase } from '@webb-tools/icons/types';
import type {
  ExternalLink,
  FooterNavsType,
  Link,
  SocialConfigsType,
} from '../types';
import {
  Common2Icon,
  DiscordFill,
  LinkedInFill,
  GithubFill,
  TelegramFill,
  TwitterFill,
  YouTubeFill,
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

export const BRIDGE_URL = 'https://app.webb.tools';
export const DKG_STATS_URL = 'https://stats.tangle.tools';
export const HUBBLE_STATS_URL = 'https://hubble-stats.webb.tools/';
export const WEBB_MKT_URL = 'https://webb.tools';

export const TANGLE_MKT_URL = 'https://tangle.tools';
export const WEBB_DOCS_URL = 'https://docs.webb.tools';
export const WEBB_BLOG_URL = 'https://blog.webb.tools';

export const WEBB_WHITEPAPER_URL = 'https://eprint.iacr.org/2023/260';
export const WEBB_CAREERS_URL = 'https://wellfound.com/company/webb-4/jobs';

export const TANGLE_TESTNET_EXPLORER_URL = 'https://explorer.tangle.tools';

export const TANGLE_STANDALONE_EXPLORER_URL =
  'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc-archive.tangle.tools#/explorer';

export const WEBB_DAPP_NEW_ISSUE_URL =
  'https://github.com/webb-tools/webb-dapp/issues/new/choose';
export const WEBB_FAUCET_URL = 'https://faucet.tangle.tools';

export const GITHUB_REQUEST_FEATURE_URL =
  'https://github.com/webb-tools/webb-dapp/issues/new?assignees=&labels=&template=feature_request.md&title=';

export const POLKADOT_EXPLORER_URL =
  'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc-archive.tangle.tools#/explorer/query';

export const FOLLOW_WEBB_TWITTER_URL =
  'https://twitter.com/intent/follow?screen_name=webbprotocol';

export const WEBB_DOC_ROUTES_RECORD = {
  concepts: {
    'anchor-system': {
      overview: '/docs/concepts/anchor-system/overview',
    },
    'distributed-key-gen': {
      route: '/docs/concepts/distributed-key-gen',
    },
    'distributed-key-gen#want-to-learn-more': {
      route: '/docs/concepts/distributed-key-gen#want-to-learn-more',
    },
    'tss-governance': {
      route: '/docs/concepts/tss-governance',
      '#how-it-works':
        '/docs/concepts/tss-governance##solution-decentralizing-trust-with-threshold-signature-scheme-tss',
    },
  },
  'tangle-network': {
    overview: '/docs/tangle-network/overview',
    community: '/docs/tangle-network/community',
  },
  protocols: {
    'single-asset-shielded-pool': {
      overview: '/docs/protocols/single-asset-shielded-pool/overview',
    },
    identity: {
      route: '/docs/protocols/identity',
    },
    'mpc-protocols': {
      'dkg-substrate': {
        overview: '/docs/protocols/mpc-protocols/dkg-substrate/overview',
      },
    },
  },
  projects: {
    'hubble-bridge': {
      overview: '/docs/projects/hubble-bridge/overview',
      'usage-guide': {
        route: '/docs/projects/hubble-bridge/usage-guide',
        account: '/docs/projects/hubble-bridge/usage-guide/account',
        transfer: {
          '#6-input-recipient-shielded-address':
            '/docs/projects/hubble-bridge/usage-guide/transfer#6-input-recipient-shielded-address',
        },
      },
    },
    'stats-dapp': {
      overview: '/docs/projects/stats-dapp/overview',
    },
  },
  'ecosystem-roles': {
    relayer: {
      'running-relayer': {
        'quick-start':
          '/docs/ecosystem-roles/relayer/running-relayer/quick-start',
      },
    },
  },
  overview: {
    'privacy-manifesto': '/docs/overview/privacy-manifesto',
  },
} as const;

export const WEBB_AVAIABLE_SOCIALS = [
  'telegram',
  'discord',
  'commonwealth',
  'linkedin',
  'twitter',
  'github',
  'youTube',
] as const;

export const SOCIAL_URLS_RECORD: {
  [key in (typeof WEBB_AVAIABLE_SOCIALS)[number]]: string;
} = {
  telegram: 'https://t.me/webbprotocol',
  discord: 'https://discord.com/invite/cv8EfJu3Tn',
  commonwealth: 'https://commonwealth.im/webb',
  linkedin: 'https://www.linkedin.com/company/webb-protocol',
  twitter: 'https://twitter.com/webbprotocol',
  github: 'https://github.com/webb-tools',
  youTube: 'https://www.youtube.com/channel/UCDro1mNK9yHGQNDvFuucwVw',
} as const;

export const SOCIAL_ICONS_RECORD: {
  [key in (typeof WEBB_AVAIABLE_SOCIALS)[number]]: (
    props: IconBase
  ) => JSX.Element;
} = {
  telegram: TelegramFill,
  discord: DiscordFill,
  commonwealth: Common2Icon,
  linkedin: LinkedInFill,
  twitter: TwitterFill,
  github: GithubFill,
  youTube: YouTubeFill,
};

export const tangleLogoConfig: Link = {
  name: 'Tangle Logo',
  path: TANGLE_MKT_URL,
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
        subqueryEndpoint: 'https://standalone-subql.tangle.tools/graphql',
        polkadotEndpoint: 'wss://rpc-archive.tangle.tools',
        polkadotExplorer: TANGLE_STANDALONE_EXPLORER_URL,
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
  href: BRIDGE_URL,
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
      href: BRIDGE_URL,
      ...commonExternalProps,
    },
  ],
  network: [
    {
      name: 'Block Explorer',
      href: TANGLE_TESTNET_EXPLORER_URL,
      ...commonExternalProps,
    },
    {
      name: 'polkadot explorer',
      href: TANGLE_STANDALONE_EXPLORER_URL,
      ...commonExternalProps,
    },
  ],
  developer: [
    {
      name: 'documentation',
      href: WEBB_DOCS_URL,
      ...commonExternalProps,
    },
    {
      name: 'source code',
      href: SOCIAL_URLS_RECORD.github,
      ...commonExternalProps,
    },
  ],
  resources: [
    {
      name: 'community',
      href: new URL(
        WEBB_DOC_ROUTES_RECORD['tangle-network'].community,
        WEBB_DOCS_URL
      ).toString(),
      ...commonExternalProps,
    },
  ],
  company: [
    {
      name: 'about us',
      href: WEBB_MKT_URL,
      ...commonExternalProps,
    },
    {
      name: 'jobs',
      href: WEBB_CAREERS_URL,
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

export const defaultSocialConfigs = WEBB_AVAIABLE_SOCIALS.map(
  (name) =>
    ({
      name,
      href: SOCIAL_URLS_RECORD[name],
      Icon: SOCIAL_ICONS_RECORD[name],
      target: '_blank',
      rel: 'noopener noreferrer',
    } as const satisfies SocialConfigsType)
);
