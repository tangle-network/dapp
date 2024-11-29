import { Card, CardVariant } from '@webb-tools/webb-ui-components';
import { Divider } from '@webb-tools/webb-ui-components/components/Divider';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import FAQSection from '@webb-tools/webb-ui-components/containers/FAQSection';
import type { FC, PropsWithChildren } from 'react';

import faqItems from '../../constants/faq';
import { OpenGraphPageImageUrl } from '../../constants/openGraph';

const pageConfig = {
  title: 'Claim Airdrop',
  metadata: {
    title: 'Claim Airdrop | Tangle Network',
    description:
      'Eligible for the TNT tokens airdrop? Tangle Network rewards early testnet participants, Edgeware community, and DOT validators. Check now!',
    openGraph: {
      title: 'Claim Airdrop | Tangle Network',
      description:
        'Eligible for the TNT tokens airdrop? Tangle Network rewards early testnet participants, Edgeware community, and DOT validators. Check now!',
      images: [{ url: OpenGraphPageImageUrl.ClaimAirdrop }],
    },
  },
};

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
