import {
  Common2Icon,
  DiscordFill,
  GithubFill,
  LinkedInFill,
  TelegramFill,
  TwitterFill,
  YouTubeFill,
  TangleIcon,
} from '@webb-tools/icons';
import type { IconBase } from '@webb-tools/icons/types';
import type {
  ExternalLink,
  FooterNavsType,
  Link,
  SocialConfigsType,
} from '../types';

/** TODO: Determine the best way to put thess configs to share across the project */
const commonExternalProps = {
  target: '_blank' as const,
};

export const logoConfig: Link = {
  name: 'Logo',
  path: '/',
};

export const BRIDGE_URL = 'https://app.webb.tools';
export const DKG_STATS_URL = 'https://stats.tangle.tools';
export const HUBBLE_STATS_URL = 'https://hubble-stats.webb.tools/';

export const TANGLE_DAPP_URL = 'https://app.tangle.tools/';
export const WEBB_MKT_URL = 'https://webb.tools';
export const TESTNET_LEADERBOARD_URL = 'https://leaderboard.tangle.tools';

export const TANGLE_MKT_URL = 'https://tangle.tools';
export const TANGLE_PRESS_KIT_URL = 'https://www.tangle.tools/press-kit';
export const TANGLE_DOCS_URL = 'https://docs.tangle.tools/docs/';
export const TANGLE_GITHUB_URL = 'https://github.com/webb-tools/tangle';
export const WEBB_DOCS_URL = 'https://docs.webb.tools';
export const WEBB_BLOG_URL = 'https://blog.webb.tools';
export const WEBB_TANGLE_DOCS_STAKING_URL =
  'https://docs.tangle.tools/docs/staking-intro/';

export const WEBB_WHITEPAPER_URL = 'https://eprint.iacr.org/2023/260';
export const TANGLE_WHITEPAPER_URL =
  'https://github.com/webb-tools/tangle/blob/main/Tangle_Network_Whitepaper_March282024.pdf';

export const WEBB_CAREERS_URL = 'https://wellfound.com/company/webb-4/jobs';

export const TANGLE_TESTNET_EVM_EXPLORER_URL =
  'https://testnet-explorer.tangle.tools';

export const TANGLE_TESTNET_NATIVE_EXPLORER_URL =
  'https://polkadot.js.org/apps/?rpc=wss://testnet-rpc.tangle.tools#/explorer';

export const WEBB_DAPP_NEW_ISSUE_URL =
  'https://github.com/webb-tools/webb-dapp/issues/new/choose';
export const WEBB_FAUCET_URL = 'https://faucet.tangle.tools';
export const WEBB_DISCORD_CHANNEL_URL =
  'https://discord.com/channels/833784453251596298/1183826417625075753';

export const GITHUB_REQUEST_FEATURE_URL =
  'https://github.com/webb-tools/webb-dapp/issues/new?assignees=&labels=feature+%E2%9E%95&projects=&template=FEATURE_REQUEST.yml&title=%5BFEAT%5D+%3Ctitle%3E';

export const GITHUB_BUG_REPORT_URL =
  'https://github.com/webb-tools/webb-dapp/issues/new?assignees=&labels=bug+%F0%9F%AA%B2&projects=&template=BUG_REPORT.yml&title=%5BBUG%5D+%3Ctitle%3E';

export const POLKADOT_EXPLORER_URL =
  'https://polkadot.js.org/apps/?rpc=wss://testnet-rpc.tangle.tools#/explorer/query';

export const FOLLOW_WEBB_TWITTER_URL =
  'https://twitter.com/intent/follow?screen_name=webbprotocol';

export const TANGLE_TWITTER_URL = 'https://twitter.com/tangle_network';

export const DKG_STATS_KEYS_URL = `${DKG_STATS_URL}/#/keys`;
export const DKG_STATS_AUTHORITIES_URL = `${DKG_STATS_URL}/#/authorities`;
export const DKG_STATS_PROPOSALS_URL = `${DKG_STATS_URL}/#/proposals`;

export const TANGLE_RPC_ENDPOINT = 'wss://testnet-rpc.tangle.tools';
export const SUBQUERY_ENDPOINT =
  'https://standalone-subql.tangle.tools/graphql';

export const TANGLE_STAKING_URL =
  'https://polkadot.js.org/apps/?rpc=wss://testnet-rpc.tangle.tools#/staking';

export const STAKING_PRECOMPILE_LINK =
  'https://github.com/webb-tools/tangle/blob/main/precompiles/staking/StakingInterface.sol';

export const TANGLE_PRIVACY_POLICY_URL = new URL(
  '/privacy-policy',
  TANGLE_MKT_URL
).toString();

export const TANGLE_TERMS_OF_SERVICE_URL = new URL(
  '/terms-of-service',
  TANGLE_MKT_URL
).toString();

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
    participate: '/docs/tangle-network/overview/#participate',
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
  community: {
    route: '/docs/community',
  },
} as const;

export const WEBB_AVAILABLE_SOCIALS = [
  'telegram',
  'discord',
  'commonwealth',
  'linkedin',
  'twitter',
  'github',
  'youTube',
  'community',
] as const;

export const SOCIAL_URLS_RECORD = {
  telegram: 'https://t.me/webbprotocol',
  discord: 'https://discord.com/invite/cv8EfJu3Tn',
  commonwealth: 'https://commonwealth.im/webb',
  linkedin: 'https://www.linkedin.com/company/webb-protocol',
  twitter: 'https://twitter.com/webbprotocol',
  github: 'https://github.com/webb-tools',
  youTube: 'https://www.youtube.com/channel/UCDro1mNK9yHGQNDvFuucwVw',
  community: 'https://www.tangle.tools/community',
} as const satisfies {
  [key in (typeof WEBB_AVAILABLE_SOCIALS)[number]]: string;
};

export const SOCIAL_ICONS_RECORD = {
  telegram: TelegramFill,
  discord: DiscordFill,
  commonwealth: Common2Icon,
  linkedin: LinkedInFill,
  twitter: TwitterFill,
  github: GithubFill,
  youTube: YouTubeFill,
  community: TangleIcon,
} as const satisfies {
  [key in (typeof WEBB_AVAILABLE_SOCIALS)[number]]: (
    props: IconBase
  ) => JSX.Element;
};

export const tangleLogoConfig: Link = {
  name: 'Tangle Logo',
  path: TANGLE_MKT_URL,
};

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
      href: TANGLE_TESTNET_EVM_EXPLORER_URL,
      ...commonExternalProps,
    },
    {
      name: 'polkadot explorer',
      href: TANGLE_TESTNET_NATIVE_EXPLORER_URL,
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
        WEBB_DOC_ROUTES_RECORD.community.route,
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

export const bottomLinks = [
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
] as const;

export const defaultSocialConfigs: SocialConfigsType[] =
  WEBB_AVAILABLE_SOCIALS.map(
    (name) =>
      ({
        name,
        href: SOCIAL_URLS_RECORD[name],
        Icon: SOCIAL_ICONS_RECORD[name],
        target: '_blank',
        rel: 'noopener noreferrer',
      } as const satisfies SocialConfigsType)
  );

/**
 * The key for the sidebar open state in the cookie and localStorage
 */
export const SIDEBAR_OPEN_KEY = 'isSidebarOpen';
