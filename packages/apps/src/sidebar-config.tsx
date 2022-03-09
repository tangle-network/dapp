import { ReactComponent as EmailIcon } from '@webb-dapp/apps/assets/email.svg';
import { SidebarConfig } from '@webb-dapp/react-components/Sidebar/types';
import React from 'react';

import { CommonWealthLogo } from './configs/logos/CommonWealthLogo';
import { DiscordLogo } from './configs/logos/DiscordLogo';
import { GithubLogo } from './configs/logos/GithubLogo';
import { TelegramLogo } from './configs/logos/TelegramLogo';
import { TwitterLogo } from './configs/logos/TwitterLogo';

export const sideBarConfig: SidebarConfig = {
  products: [
    {
      path: 'tornado',
      name: 'Tornados',
    },
    {
      path: 'bridge',
      name: 'Bridges',
    },
    {
      path: 'wrap-unwrap',
      name: 'Wrap/Unwrap',
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
