import { ChainIcon } from '@webb-tools/icons';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
} from '@webb-tools/webb-ui-components/components/Tabs';

import Heading2 from '../Heading2';
import SubHeading from '../SubHeading';
import useDynamicLottiePlayer from '../../hooks/useDynamicLottiePlayer';
import { FC, useState } from 'react';
import { Transition } from '@headlessui/react';

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

const PrivacyConnectedSection = () => {
  // State for the selected tab
  const [activeTab, setActiveTab] = useState<TabTypes>('ownership');

  // Dynamic loading the lottie player in client side
  useDynamicLottiePlayer();

  return (
    <section className="max-w-[932px] mx-auto py-[156px] flex flex-col justify-center w-full">
      <ChainIcon name="tangle" className="mx-auto w-7 h-7" />
      <Heading2 className="text-[48px] leading-[72px] text-mono-200 font-bold text-center mt-6">
        The Future of privacy is Connected
      </Heading2>
      <SubHeading className="text-center mt-9">
        Connecting private applications across chains allows us to scale the
        size of privacy sets to encompass all the users and data possible in our
        Web3 ecosystem.
      </SubHeading>
      <TabsRoot
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={(nextTab) => setActiveTab(nextTab as TabTypes)}
        className="p-4 space-y-4 rounded-lg mt-9 bg-mono-0"
      >
        <TabsList aria-label="tabs" className="mb-4">
          {Object.entries(tabsContent).map(([key, value]) => (
            <TabTrigger key={key} value={key}>
              {value.title}
            </TabTrigger>
          ))}
        </TabsList>

        {/* Tabs content */}
        {Object.entries(tabsContent).map(([key, value]) => (
          <Transition
            appear
            show={key === activeTab}
            enter="transition-opacity duration-[1000]"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-[1000]"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            key={key}
          >
            <TabContent className="w-[900px] h-[340px]" value={key}>
              <LottiePlayer animationUrl={value.animationUrl} />
            </TabContent>
          </Transition>
        ))}
      </TabsRoot>
    </section>
  );
};

export default PrivacyConnectedSection;

const LottiePlayer: FC<{ animationUrl: string }> = ({ animationUrl }) => {
  return (
    <dotlottie-player
      src={animationUrl}
      autoplay
      loop
      style={{ height: '100%', width: '100%' }}
    />
  );
};
