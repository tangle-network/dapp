import { ChainIcon } from '@webb-tools/icons';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';

const tabsContent = {
  ownership: {
    animationUrl: '/animations/deposit.lottie',
    title: 'Proof of Ownership',
  },
  identity: {
    animationUrl: '/animations/kyc.lottie',
    title: 'Proof of Identity',
  },
  privacy: {
    animationUrl: '/animations/ecosystem.lottie',
    title: 'Privacy Ecosystems',
  },
};

type TabTypes = 'ownership' | 'identity' | 'privacy';

export const PrivacyConnectedSection = () => {
  // State for the selected tab
  const [activeTab, setActiveTab] = useState<TabTypes>('ownership');

  return (
    <section className="max-w-[932px] mx-auto md:py-[156px] flex flex-col justify-center w-full">
      <ChainIcon name="webb" size="lg" className="mx-auto" />

      <Typography
        variant="mkt-h3"
        className="px-4 mt-6 text-center text-mono-200 font-black"
      >
        The Future of privacy is Connected
      </Typography>

      <Typography
        variant="mkt-body1"
        className="px-4 mt-6 text-center md:mt-9 text-mono-140 font-medium"
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
    <dotlottie-player
      src={animationUrl}
      autoplay
      speed={0.8}
      loop
      style={{ height: '100%', width: '100%' }}
    />
  );
};
