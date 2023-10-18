import { FaucetIcon } from '@webb-tools/icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  SideBarMenu,
} from '@webb-tools/webb-ui-components';
import {
  BRIDGE_URL,
  GITHUB_REQUEST_FEATURE_URL,
  SOCIAL_URLS_RECORD,
  TANGLE_MKT_URL,
  TANGLE_STANDALONE_EXPLORER_URL,
} from '@webb-tools/webb-ui-components/constants';
import { type FC } from 'react';

import { TANGLE_DOCS_URL } from '../constants';
import sideBarProps from '../constants/sidebar';

const Header: FC = () => {
  return (
    <header className="flex items-center justify-between pt-6 pb-4">
      <div className="flex items-center gap-2">
        <SideBarMenu {...sideBarProps} className="lg:hidden" />
        <Breadcrumbs className="hidden md:block">
          <BreadcrumbsItem icon={<FaucetIcon />} isLast={true}>
            Faucet
          </BreadcrumbsItem>
        </Breadcrumbs>
      </div>

      {/* <HeaderChipsContainer /> */}
      <div className="flex items-center gap-2">
        <Button href={BRIDGE_URL} target="_blank" rel="noreferrer">
          Webb dApp
        </Button>

        <NavigationMenu>
          <NavigationMenuTrigger />
          {/** TODO: Refactor these links into a config file and make the menu items dynamically based on the config */}
          <NavigationMenuContent
            onDocsClick={() => window.open(TANGLE_DOCS_URL, '_blank')}
            onTestnetClick={() =>
              window.open(TANGLE_STANDALONE_EXPLORER_URL, '_blank')
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
    </header>
  );
};

export default Header;
