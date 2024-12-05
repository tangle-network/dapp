'use client';

import { Footer } from '@webb-tools/webb-ui-components';
import {
  bottomLinks,
  TANGLE_PRIVACY_POLICY_URL,
  TANGLE_SOCIAL_URLS_RECORD,
  TANGLE_TERMS_OF_SERVICE_URL,
  WEBB_AVAILABLE_SOCIALS,
} from '@webb-tools/webb-ui-components/constants';
import { useLayoutBgClassName } from '@webb-tools/tangle-shared-ui/hooks/useLayoutBgClassName';
import { type FC, type PropsWithChildren } from 'react';

import {
  BridgeTxQueueDropdown,
  MobileSidebar,
  Sidebar,
} from '../../components';
import { IS_PRODUCTION_ENV } from '../../constants/env';
import ApiDevStatsContainer from '../DebugMetricsContainer';
import WalletAndChainContainer from '../WalletAndChainContainer/WalletAndChainContainer';

// Some specific overrides for the social links for use in the
// footer in Tangle dApp, since it defaults to the Webb socials.
const SOCIAL_LINK_OVERRIDES: Partial<
  Record<(typeof WEBB_AVAILABLE_SOCIALS)[number], string>
> = TANGLE_SOCIAL_URLS_RECORD;

const BOTTOM_LINK_OVERRIDES: Partial<
  Record<(typeof bottomLinks)[number]['name'], string>
> = {
  'Terms of Service': TANGLE_TERMS_OF_SERVICE_URL,
  'Privacy Policy': TANGLE_PRIVACY_POLICY_URL,
};

interface LayoutProps {
  isSidebarInitiallyExpanded?: boolean;
}

const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  isSidebarInitiallyExpanded,
  children,
}) => {
  const layoutBgClassname = useLayoutBgClassName();

  return (
    <div className={`flex h-screen ${layoutBgClassname}`}>
      <Sidebar isExpandedByDefault={isSidebarInitiallyExpanded} />

      <main className="flex-1 h-full overflow-y-auto scrollbar-hide">
        <div className="h-full max-w-[1448px] lg:px-10 md:px-8 px-4 m-auto flex flex-col justify-between">
          <div className="flex flex-col space-y-5 grow">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4 lg:space-x-0">
                <MobileSidebar />
              </div>

              <div className="flex items-center gap-2">
                <WalletAndChainContainer />

                <BridgeTxQueueDropdown />
              </div>
            </div>

            {children}
          </div>

          <Footer
            socialsLinkOverrides={SOCIAL_LINK_OVERRIDES}
            bottomLinkOverrides={BOTTOM_LINK_OVERRIDES}
            isMinimal
            className="py-8"
          />
        </div>
      </main>

      {!IS_PRODUCTION_ENV && <ApiDevStatsContainer />}
    </div>
  );
};

export default Layout;
