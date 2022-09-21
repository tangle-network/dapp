import { SidebarConfig } from '@webb-dapp/react-components/Sidebar/types';
import React from 'react';

import { CommonWealthLogo } from './configs/logos/CommonWealthLogo';
import { DiscordLogo } from './configs/logos/DiscordLogo';
import { GithubLogo } from './configs/logos/GithubLogo';
import { BridgePageLogo } from './configs/logos/pages/BridgePageLogo';
import { CrowdloanPageLogo } from './configs/logos/pages/CrowdloanPageLogo';
import { GovernancePageLogo } from './configs/logos/pages/GovernancePageLogo';
import { MixerPageLogo } from './configs/logos/pages/MixerPageLogo';
import { WrapPageLogo } from './configs/logos/pages/WrapPageLogo';
import { TelegramLogo } from './configs/logos/TelegramLogo';
import { TwitterLogo } from './configs/logos/TwitterLogo';

export const sideBarConfig: SidebarConfig = {
  products: [
    {
      path: 'mixer',
      name: 'Mixers',
      icon: <MixerPageLogo />,
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
      path: 'crowdloan',
      name: 'Crowdloan',
      icon: <CrowdloanPageLogo />,
    },
    {
      name: 'Governance',
      icon: <GovernancePageLogo />,
      items: [
        {
          path: 'governance/substrate-democracy',
          name: 'Substrate Democracy',
        },
      ],
    },
    {
      name: 'ECDSA Claims',
      icon: <GovernancePageLogo />,
      path: 'claims',
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
      href: 'https://discord.gg/cv8EfJu3Tn',
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
