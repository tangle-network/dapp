import { Footer } from '@webb-tools/webb-ui-components';
import {
  bottomLinks,
  TANGLE_PRIVACY_POLICY_URL,
  TANGLE_SOCIAL_URLS_RECORD,
  TANGLE_TERMS_OF_SERVICE_URL,
  WEBB_AVAILABLE_SOCIALS,
} from '@webb-tools/webb-ui-components/constants';
import { getSidebarStateFromCookie } from '@webb-tools/webb-ui-components/next-utils';
import { type FC, type PropsWithChildren } from 'react';

import { Breadcrumbs, Sidebar, SidebarMenu } from '../../components';
import { IS_PRODUCTION_ENV } from '../../constants/env';
import ApiDevStatsContainer from '../ApiDevStatsContainer';
import WalletAndChainContainer from '../WalletAndChainContainer/WalletAndChainContainer';
import { WalletModalContainer } from '../WalletModalContainer';
import FeedbackBanner from './FeedbackBanner';

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

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const isSidebarInitiallyExpanded = getSidebarStateFromCookie();

  return (
    <div className="flex h-screen bg-body">
      <Sidebar isExpandedAtDefault={isSidebarInitiallyExpanded} />

      <main className="flex-1 h-full overflow-y-auto scrollbar-hide">
        <FeedbackBanner />
        <div className="h-full max-w-[1448px] lg:px-12 md:px-8 px-4 m-auto flex flex-col justify-between">
          <div className="flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4 lg:space-x-0">
                <SidebarMenu />

                <Breadcrumbs className="hidden md:block" />
              </div>

              <WalletAndChainContainer />
            </div>

            <Breadcrumbs className="md:hidden !mt-0" />

            {children}

            <WalletModalContainer />
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
