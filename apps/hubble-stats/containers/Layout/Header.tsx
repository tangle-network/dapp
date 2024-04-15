'use client';

import React, { type FC } from 'react';
import {
  Button,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  Logo,
} from '@webb-tools/webb-ui-components';
import { TANGLE_TESTNET_NATIVE_EXPLORER_URL } from '@webb-tools/dapp-config/constants/tangle';
import { WebbLogoIcon } from '@webb-tools/icons';
import { Breadcrumbs, SideBarMenu } from '../../components';
import {
  BRIDGE_URL,
  WEBB_DOCS_URL,
  GITHUB_REQUEST_FEATURE_URL,
  SOCIAL_URLS_RECORD,
  TANGLE_MKT_URL,
} from '@webb-tools/webb-ui-components/constants';

const Header: FC = () => {
  return (
    <div className="flex items-center justify-between pt-6 pb-4">
      <div className="flex items-center gap-2">
        <SideBarMenu />

        {/* Show Logo without name on mobile */}
        <WebbLogoIcon className="md:hidden" size="lg" />

        {/* Show Logo with name on tablet */}
        <Logo className="hidden md:block lg:hidden" />

        <Breadcrumbs className="hidden lg:flex" />
      </div>

      <div className="flex items-center gap-2">
        <Button href={BRIDGE_URL} target="_blank" rel="noreferrer">
          Webb dApp
        </Button>

        <NavigationMenu>
          <NavigationMenuTrigger />
          <NavigationMenuContent
            onDocsClick={() => window.open(WEBB_DOCS_URL, '_blank')}
            onTestnetClick={() =>
              window.open(TANGLE_TESTNET_NATIVE_EXPLORER_URL, '_blank')
            }
            onHelpCenterClick={() =>
              window.open(SOCIAL_URLS_RECORD.telegram, '_blank')
            }
            onRequestFeaturesClick={() =>
              window.open(GITHUB_REQUEST_FEATURE_URL, '_blank')
            }
            onAboutClick={() => window.open(TANGLE_MKT_URL, '_blank')}
          />
        </NavigationMenu>
      </div>
    </div>
  );
};

export default Header;
