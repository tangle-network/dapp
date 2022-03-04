import { SidebarConfig } from '@webb-dapp/react-components/Sidebar/types';
import { themeOverrides } from '@webb-dapp/ui-components/styling/themes/overides/light-theme-overrides';
import React from 'react';

import { CommonWealthLogo } from './configs/logos/CommonWealthLogo';
import { DiscordLogo } from './configs/logos/DiscordLogo';
import { GithubLogo } from './configs/logos/GithubLogo';
// import { ReactComponent as TornadoPageLogo } from '@webb-dapp/apps/assets/TornadoPageLogo.svg';
// import { ReactComponent as BridgePageLogo } from '@webb-dapp/apps/assets/BridgePageLogo.svg';
// import { ReactComponent as WrapPageLogo } from '@webb-dapp/apps/assets/WrapPageLogo.svg';
// import { ReactComponent as GovernancePageLogo } from '@webb-dapp/apps/assets/GovernancePageLogo.svg';
// import { ReactComponent as CrowdloanPageLogo } from '@webb-dapp/apps/assets/CrowdloanPageLogo.svg';
// import { ReactComponent as StatisticsPageLogo } from '@webb-dapp/apps/assets/StatisticsPageLogo.svg';
import { BridgePageLogo } from './configs/logos/pages/BridgePageLogo';
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
    // {
    //   path: 'governance',
    //   name: 'Governance',
    //   items: [
    //     {
    //       path: 'governance',
    //       name: 'Substrate Democracy',
    //     }
    //   ]
    // },
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
