import { ReactComponent as EmailIcon } from '@webb-dapp/apps/assets/email.svg';
import { ReactComponent as TwitterIcon } from '@webb-dapp/apps/assets/twitter.svg';
import { SidebarConfig } from '@webb-dapp/react-components/Sidebar/types';
import React from 'react';

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
      href: 'mailto:drew@webb.tools',
      icon: <EmailIcon />,
      name: 'Email',
      rel: 'email',
    },
    {
      href: 'https://twitter.com/webbprotocol',
      icon: <TwitterIcon />,
      name: 'Twitter',
      rel: 'twitter',
    },
  ],
};
