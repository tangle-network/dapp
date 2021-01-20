import React from 'react';

import { ReactComponent as TwitterIcon } from '@webb-dapp/apps/assets/twitter.svg';
import { ReactComponent as EmailIcon } from '@webb-dapp/apps/assets/email.svg';
import { ReactComponent as ExchangeIcon } from '@webb-dapp/apps/assets/exchange.svg';
import { ReactComponent as GovernanceIcon } from '@webb-dapp/apps/assets/governance.svg';
import { ReactComponent as GuideIcon } from '@webb-dapp/apps/assets/guide.svg';
import { ReactComponent as FaucetIcon } from '@webb-dapp/apps/assets/faucet.svg';
import { SidebarConfig } from '@webb-dapp/react-components/Sidebar';

export const sideBarConfig: SidebarConfig = {
  products: [
    {
      icon: <ExchangeIcon />,
      name: 'Mixer',
      path: 'mixer'
    },
    {
      icon: <GovernanceIcon />,
      name: 'Governance',
      path: 'governance'
    }
  ],
  socialPlatforms: [
    {
      href: 'https://discord.gg/CmqXvMP',
      icon: <FaucetIcon />,
      name: 'Faucet',
      rel: 'faucet'
    },
    {
      href: 'https://github.com/AcalaNetwork/Acala/wiki',
      icon: <GuideIcon />,
      name: 'Wiki',
      rel: 'wiki'
    },
    {
      href: 'mailto:hello@acala.network',
      icon: <EmailIcon />,
      name: 'Email',
      rel: 'email'
    },
    {
      href: 'https://twitter.com/AcalaNetwork',
      icon: <TwitterIcon />,
      name: 'Twitter',
      rel: 'twitter'
    }
  ]
};
