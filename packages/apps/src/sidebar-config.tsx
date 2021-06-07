import { ReactComponent as EmailIcon } from '@webb-dapp/apps/assets/email.svg';
import { ReactComponent as ExchangeIcon } from '@webb-dapp/apps/assets/exchange.svg';
import { ReactComponent as GovernanceIcon } from '@webb-dapp/apps/assets/governance.svg';
import { ReactComponent as TwitterIcon } from '@webb-dapp/apps/assets/twitter.svg';
import { SidebarConfig } from '@webb-dapp/react-components/Sidebar/types';
import React from 'react';

export const sideBarConfig: SidebarConfig = {
  products: [
    {
      icon: <ExchangeIcon />,
      name: 'Mixer',
      path: 'mixer',
      requiredFeatures: ['mixer'],
    },
    {
      icon: <GovernanceIcon />,
      name: 'Governance',
      path: 'governance',
    },
  ],
  socialPlatforms: [
    {
      href: 'mailto:drew@webb.tools',
      icon: <EmailIcon />,
      name: 'Email',
      rel: 'email',
    },
    {
      href: 'https://twitter.com/thewebbnet',
      icon: <TwitterIcon />,
      name: 'Twitter',
      rel: 'twitter',
    },
  ],
};
