import { SidebarConfig } from '@webb-dapp/react-components/Sidebar/types';
import React from 'react';

import { CommonWealthLogo } from './configs/logos/CommonWealthLogo';
import { DiscordLogo } from './configs/logos/DiscordLogo';
import { GithubLogo } from './configs/logos/GithubLogo';
import { BridgePageLogo } from './configs/logos/pages/BridgePageLogo';
import { StatisticsPageLogo } from './configs/logos/pages/StatisticsPageLogo';
import { TornadoPageLogo } from './configs/logos/pages/TornadoPageLogo';
import { WrapPageLogo } from './configs/logos/pages/WrapPageLogo';
import { TelegramLogo } from './configs/logos/TelegramLogo';
import { TwitterLogo } from './configs/logos/TwitterLogo';

export const sideBarConfig: SidebarConfig = {
  products: [
    {
      path: 'tornado',
      name: 'Tornados',
      icon: <TornadoPageLogo />,
    },
    {
      path: 'bridge',
      name: 'Bridges',
      icon: <BridgePageLogo />,
    },
    {
      path: 'wrap-unwrap',
      name: 'Wrap/Unwrap',
      icon: <WrapPageLogo />,
    },
    {
      path: 'statistics',
      name: 'Statistics',
      icon: <StatisticsPageLogo />,
      items: [
        {
          path: 'statistics/overview',
          name: 'Overview',
        },
        {
          path: 'statistics/deposits',
          name: 'Deposits',
        },
        {
          path: 'statistics/withdrawals',
          name: 'Withdrawals',
        },
        {
          path: 'statistics/relayers',
          name: 'Relayers',
        },
        {
          path: 'statistics/dkg',
          name: 'DKG Governance',
        },
      ],
    },
  ],
  socialPlatforms: [
    {
      href: 'https://twitter.com/webbprotocol',
      icon: <TwitterLogo />,
      name: 'Twitter',
      rel: 'twitter',
    },
    {
      href: 'https://discord.gg/cBQHf6B7',
      icon: <DiscordLogo />,
      name: 'Discord',
      rel: 'discord',
    },
    {
      href: 'https://t.me/webbprotocol',
      icon: <TelegramLogo />,
      name: 'Telegram',
      rel: 'telegram',
    },
    {
      href: 'https://github.com/webb-tools',
      icon: <GithubLogo />,
      name: 'Github',
      rel: 'github',
    },
    {
      href: 'https://commonwealth.im/webb',
      icon: <CommonWealthLogo />,
      name: 'Commonwealth',
      rel: 'commonwealth',
    },
  ],
};
