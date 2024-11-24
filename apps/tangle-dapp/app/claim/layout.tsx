import { Card, CardVariant } from '@webb-tools/webb-ui-components';
import { Divider } from '@webb-tools/webb-ui-components/components/Divider';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import FAQSection from '@webb-tools/webb-ui-components/containers/FAQSection';
import { Metadata } from 'next';
import type { FC, PropsWithChildren } from 'react';

import faqItems from '../../constants/faq';
import { OpenGraphPageImageUrl } from '../../constants/openGraph';
import createPageMetadata from '../../utils/createPageMetadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Claim Airdrop',
  imageUrl: OpenGraphPageImageUrl.ClaimAirdrop,
  description:
    'Eligible for the TNT tokens airdrop? Tangle Network rewards early testnet participants, Edgeware community, and DOT validators. Check now!',
});

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AppTemplate.Root className="border-none p-0 rounded-none">
      <Card variant={CardVariant.GLASS} className="space-y-4 py-8">
        {children}

        <Divider className="my-16 bg-mono-180 dark:bg-mono-120" />

        <AppTemplate.Content className="w-full">
          <FAQSection
            items={faqItems}
            answerClassName="[&_a:hover]:text-mono-100 [&_a]:underline"
          />
        </AppTemplate.Content>
      </Card>
    </AppTemplate.Root>
  );
};

export default Layout;
