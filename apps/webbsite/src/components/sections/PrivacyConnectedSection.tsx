import { ChainIcon } from '@webb-tools/icons';
import {
  TabContent,
  TabTrigger,
  TabsList,
  TabsRoot,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';
import Lottie from 'react-lottie-player';

const tabsContent: Record<
  string,
  {
    animationUrl: string;
    title: string;
  }
> = {
  ownership: {
    animationUrl: '/animations/deposit.json',
    title: 'Proof of Ownership',
  },
  identity: {
    animationUrl: '/animations/kyc.json',
    title: 'Proof of Identity',
  },
  privacy: {
    animationUrl: '/animations/ecosystem.json',
    title: 'Privacy Ecosystems',
  },
};

type TabTypes = 'ownership' | 'identity' | 'privacy';

export const PrivacyConnectedSection = () => {
  // State for the selected tab
  const [activeTab, setActiveTab] = useState<TabTypes>('ownership');

  return (
    <section className="max-w-[932px] mx-auto pt-16 md:py-[156px] flex flex-col justify-center w-full">
      <ChainIcon name="webb" size="lg" className="mx-auto" />

      <Typography
        variant="mkt-h3"
        className="px-4 mt-6 font-black text-center text-mono-200"
      >
        The Future of privacy is Connected
      </Typography>

      <Typography
        variant="mkt-body1"
        className="px-4 mt-6 font-medium text-center md:mt-9 text-mono-140"
      >
        Connecting private applications across chains allows us to scale the
        size of privacy sets to encompass all the users and data possible in our
        Web3 ecosystem.
      </Typography>

      <TabsRoot
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={(nextTab) => setActiveTab(nextTab as TabTypes)}
        className="p-4 space-y-4 rounded-lg shadow-md mt-9 bg-mono-0"
      >
        <TabsList aria-label="tabs" className="mb-4">
          {Object.entries(tabsContent).map(([key, value]) => (
            <TabTrigger className="px-2" key={key} value={key}>
              {value.title}
            </TabTrigger>
          ))}
        </TabsList>

        {/* Tabs content */}
        {Object.entries(tabsContent).map(([key, value]) => (
          <TabContent
            key={key}
            className="max-w-[900px] max-h-[340px] w-full h-max min-h-[120px] md:min-h-[320px]"
            value={key}
          >
            <LottiePlayer animationUrl={value.animationUrl} />
          </TabContent>
        ))}
      </TabsRoot>
    </section>
  );
};

const LottiePlayer: FC<{ animationUrl: string }> = ({ animationUrl }) => {
  return (
    <Lottie
      path={animationUrl}
      play
      speed={0.8}
      loop
      className="w-full h-full"
    />
  );
};
