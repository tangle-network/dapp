import { Divider } from '@webb-tools/webb-ui-components/components/Divider';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import FAQSection from '@webb-tools/webb-ui-components/containers/FAQSection';
import { Metadata } from 'next';
import type { FC, PropsWithChildren } from 'react';

import faqItems from '../../constants/faq';
import { OpenGraphPageImageUrl } from '../../constants/openGraph';
import createPageMetadata from '../../utils/createPageMetadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Claim Airdrop',
  imageUrl: OpenGraphPageImageUrl.ClaimAirdrop,
  description:
    'Eligible for TNT tokens? Tangle Network rewards early testnet participants, Edgeware community, and DOT validators. Check now!',
});

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AppTemplate.Root className="bg-glass dark:bg-glass_dark">
      {children}

      <Divider className="my-16 bg-mono-180 dark:bg-mono-120" />

      <AppTemplate.Content>
        <FAQSection
          items={faqItems}
          answerClassName="[&_a:hover]:text-mono-100 [&_a]:underline"
        />
      </AppTemplate.Content>
    </AppTemplate.Root>
  );
};

export default Layout;
