import { Card, CardVariant } from '@tangle-network/ui-components';
import { Divider } from '@tangle-network/ui-components/components/Divider';
import { AppTemplate } from '@tangle-network/ui-components/containers/AppTemplate';
import FAQSection from '@tangle-network/ui-components/containers/FAQSection';
import type { FC } from 'react';
import { Outlet } from 'react-router';
import faqItems from '../../constants/faq';

const Layout: FC = () => {
  return (
    <AppTemplate.Root className="p-0 border-none rounded-none">
      <Card variant={CardVariant.GLASS} className="py-8 space-y-4">
        {/** Outlet is used to render the child routes */}
        <Outlet />

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
