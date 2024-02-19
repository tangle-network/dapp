import { Divider } from '@webb-tools/webb-ui-components/components/Divider';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import FAQSection from '@webb-tools/webb-ui-components/containers/FAQSection';
import type { FC, PropsWithChildren } from 'react';

import faqItems from '../../constants/faq';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AppTemplate.Root>
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
