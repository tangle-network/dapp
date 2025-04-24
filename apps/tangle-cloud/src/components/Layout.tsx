import { Footer } from '@tangle-network/ui-components/components/Footer';
import Sidebar from './Sidebar';
import { FC, PropsWithChildren } from 'react';
import {
  bottomLinks,
  TANGLE_PRIVACY_POLICY_URL,
  TANGLE_SOCIAL_URLS_RECORD,
  TANGLE_TERMS_OF_SERVICE_URL,
} from '@tangle-network/ui-components/constants';

type Props = {
  isSidebarInitiallyExpanded?: boolean;
};

const BOTTOM_LINK_OVERRIDES: Partial<
  Record<(typeof bottomLinks)[number]['name'], string>
> = {
  'Terms of Service': TANGLE_TERMS_OF_SERVICE_URL,
  'Privacy Policy': TANGLE_PRIVACY_POLICY_URL,
};

const Layout: FC<PropsWithChildren<Props>> = ({
  children,
  isSidebarInitiallyExpanded,
}) => {
  return (
    <div className={`flex max-h-screen bg-tangle`}>
      <Sidebar isExpandedByDefault={isSidebarInitiallyExpanded} />

      <div className="flex flex-col flex-1 min-h-screen overflow-y-auto scrollbar-hide">
        <main className="flex-1">{children}</main>

        <Footer
          socialsLinkOverrides={TANGLE_SOCIAL_URLS_RECORD}
          bottomLinkOverrides={BOTTOM_LINK_OVERRIDES}
          isMinimal
          className="px-6 py-8"
        />
      </div>
    </div>
  );
};

export default Layout;
