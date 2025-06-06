import {
  TANGLE_MAINNET_NATIVE_EXPLORER_URL,
  TANGLE_MAINNET_EVM_EXPLORER_URL,
} from '@tangle-network/dapp-config/constants/tangle';
import {
  Common2Icon,
  DiscordFill,
  GithubFill,
  LinkedInFill,
  TelegramFill,
  TwitterFill,
  YouTubeFill,
} from '@tangle-network/icons';
import type { IconBase } from '@tangle-network/icons/types';
import type { FooterNavsType, Link, SocialConfigsType } from '../types';

/** TODO: Determine the best way to put thess configs to share across the project */
const commonExternalProps = {
  target: '_blank' as const,
};

export const logoConfig: Link = {
  name: 'Logo',
  path: '/',
};

export const DKG_STATS_URL = 'https://stats.tangle.tools';

export const TANGLE_DAPP_URL = 'https://app.tangle.tools/';
export const TESTNET_LEADERBOARD_URL = 'https://leaderboard.tangle.tools';

export const TANGLE_MKT_URL = 'https://tangle.tools';
export const TANGLE_PRESS_KIT_URL = 'https://www.tangle.tools/press-kit';
export const TANGLE_DOCS_URL = 'https://docs.tangle.tools/';
export const TANGLE_DOCS_STAKING_URL =
  'https://docs.tangle.tools/restake/staking-intro';
export const TANGLE_DOCS_LIQUID_STAKING_URL =
  'https://docs.tangle.tools/restake/lst-concepts';
export const TANGLE_DOCS_LS_CREATE_POOL_URL =
  'https://docs.tangle.tools/restake/create_a_pool/lst-pool-create-tangle';
export const TANGLE_DOCS_LS_UPDATE_ROLES_URL =
  'https://docs.tangle.tools/restake/create_a_pool/pool-roles#roles-in-a-liquid-staking-pool';
export const TANGLE_DOCS_RESTAKING_URL =
  'https://docs.tangle.tools/restake/restake-introduction';
export const TANGLE_GITHUB_URL = 'https://github.com/tangle-network/tangle';

export const WEBB_WHITEPAPER_URL = 'https://eprint.iacr.org/2023/260';
export const TANGLE_WHITEPAPER_URL =
  'https://github.com/tangle-network/tangle/blob/main/Tangle_Network_Whitepaper_March282024.pdf';

export const WEBB_CAREERS_URL = 'https://wellfound.com/company/webb-4/jobs';

export const WEBB_DAPP_NEW_ISSUE_URL =
  'https://github.com/tangle-network/dapp/issues/new/choose';
export const TANGLE_FAUCET_URL = 'https://faucet.tangle.tools';
export const WEBB_DISCORD_CHANNEL_URL =
  'https://discord.com/channels/833784453251596298/1183826417625075753';

export const GITHUB_REQUEST_FEATURE_URL =
  'https://github.com/tangle-network/dapp/issues/new?assignees=&labels=feature+%E2%9E%95&projects=&template=FEATURE_REQUEST.yml&title=%5BFEAT%5D+%3Ctitle%3E';

export const GITHUB_BUG_REPORT_URL =
  'https://github.com/tangle-network/dapp/issues/new?assignees=&labels=bug+%F0%9F%AA%B2&projects=&template=BUG_REPORT.yml&title=%5BBUG%5D+%3Ctitle%3E';

// TODO: remove this, only use in the old stats dapp
export const POLKADOT_JS_EXPLORER_URL =
  'https://polkadot.js.org/apps/?rpc=wss://testnet-rpc.tangle.tools#/explorer/query';

export const TANGLE_TWITTER_URL = 'https://twitter.com/tangle_network';

export const DKG_STATS_KEYS_URL = `${DKG_STATS_URL}/#/keys`;
export const DKG_STATS_AUTHORITIES_URL = `${DKG_STATS_URL}/#/authorities`;
export const DKG_STATS_PROPOSALS_URL = `${DKG_STATS_URL}/#/proposals`;

export const SUBQUERY_ENDPOINT =
  'https://standalone-subql.tangle.tools/graphql';

export const TANGLE_TESTNET_STAKING_URL =
  'https://polkadot.js.org/apps/?rpc=wss://testnet-rpc.tangle.tools#/staking';

export const STAKING_PRECOMPILE_LINK =
  'https://github.com/tangle-network/tangle/blob/main/precompiles/staking/StakingInterface.sol';

export const TANGLE_PRIVACY_POLICY_URL = new URL(
  '/privacy-policy',
  TANGLE_MKT_URL,
).toString();

export const TANGLE_TERMS_OF_SERVICE_URL = new URL(
  '/terms-of-service',
  TANGLE_MKT_URL,
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
  projects: {},
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

export const TANGLE_AVAILABLE_SOCIALS = [
  'telegram',
  'discord',
  'commonwealth',
  'linkedin',
  'twitter',
  'github',
  'youTube',
] as const;

export const SOCIAL_URLS_RECORD = {
  telegram: 'https://t.me/tanglenet',
  discord: 'https://discord.com/invite/cv8EfJu3Tn',
  commonwealth: 'https://commonwealth.im/tangle',
  linkedin: 'https://www.linkedin.com/company/tanglenetwork',
  twitter: 'https://twitter.com/tangle_network',
  github: 'https://github.com/tangle-network',
  youTube: 'https://www.youtube.com/@tanglenetwork',
} as const satisfies {
  [key in (typeof TANGLE_AVAILABLE_SOCIALS)[number]]: string;
};

export const TANGLE_SOCIAL_URLS_RECORD = {
  telegram: 'https://t.me/tanglenet',
  commonwealth: 'https://commonwealth.im/tangle',
  twitter: TANGLE_TWITTER_URL,
  youTube: 'https://www.youtube.com/@TangleNetwork',
  github: TANGLE_GITHUB_URL,
} as const satisfies Partial<{
  [key in (typeof TANGLE_AVAILABLE_SOCIALS)[number]]: string;
}>;

export const SOCIAL_ICONS_RECORD = {
  telegram: TelegramFill,
  discord: DiscordFill,
  commonwealth: Common2Icon,
  linkedin: LinkedInFill,
  twitter: TwitterFill,
  github: GithubFill,
  youTube: YouTubeFill,
} as const satisfies {
  [key in (typeof TANGLE_AVAILABLE_SOCIALS)[number]]: (
    props: IconBase,
  ) => JSX.Element;
};

export const tangleLogoConfig: Link = {
  name: 'Tangle Logo',
  path: TANGLE_MKT_URL,
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
  network: [
    {
      name: 'Tangle EVM Explorer',
      href: TANGLE_MAINNET_EVM_EXPLORER_URL,
      ...commonExternalProps,
    },
    {
      name: 'Tangle Native explorer',
      href: TANGLE_MAINNET_NATIVE_EXPLORER_URL,
      ...commonExternalProps,
    },
  ],
  developer: [
    {
      name: 'documentation',
      href: TANGLE_DOCS_URL,
      ...commonExternalProps,
    },
    {
      name: 'source code',
      href: SOCIAL_URLS_RECORD.github,
      ...commonExternalProps,
    },
  ],
  company: [
    {
      name: 'about us',
      href: TANGLE_MKT_URL,
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
    href: TANGLE_TERMS_OF_SERVICE_URL,
    ...commonExternalProps,
  },
  {
    name: 'Privacy Policy',
    href: TANGLE_PRIVACY_POLICY_URL,
    ...commonExternalProps,
  },
] as const;

export const defaultSocialConfigs = TANGLE_AVAILABLE_SOCIALS.map(
  (name) =>
    ({
      name,
      href: SOCIAL_URLS_RECORD[name],
      Icon: SOCIAL_ICONS_RECORD[name],
      target: '_blank',
      rel: 'noopener noreferrer',
    }) as const satisfies SocialConfigsType,
);

/**
 * The key for the sidebar open state in the cookie and localStorage
 */
export const SIDEBAR_OPEN_KEY = 'isSidebarOpen';

export const EMPTY_VALUE_PLACEHOLDER = '—';

export const TANGLE_CLOUD_URL = 'https://cloud.tangle.tools';
