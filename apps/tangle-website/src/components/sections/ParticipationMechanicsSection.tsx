import { useState } from 'react';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';

import { SectionDescription, SectionHeader, SectionTitle } from '..';
import {
  WEBB_DOCS_URL,
  NODE_OPERATORS_URL,
  POLKADOT_TANGLE_URL,
} from '../../constants';

interface TangleFeatureCardProps {
  tabName: string;
}

const tabsContent = {
  'Claim Airdrop': {
    title: 'Claim Airdrop',
    description:
      "As part of Tangle's initial launch, the Tangle Network is distributing 5,000,000 TNT tokens to the community. Check eligibility below to see if you qualify for TNT Airdrop!",
    linkText: 'Check Eligibility',
    linkUrl: WEBB_DOCS_URL,
  },
  Collator: {
    title: 'Become a Collator',
    description:
      'Running a collator node on the Tangle Network allows you to connect to the network, sync with a bootnode, obtain local access to PC endpoints, and author blocks. The network rewards collators by paying a set amount of TNT tokens as rewards.',
    linkText: 'Earn Now',
    linkUrl: NODE_OPERATORS_URL,
  },
  Governance: {
    title: 'Participate in Governance',
    description:
      "Through Tangle's on-chain governance system, you can create proposals for updating cross-chain applications. Tangle token holders can propose changes to the Tangle network.",
    linkText: 'Get Tokens',
    linkUrl: POLKADOT_TANGLE_URL,
  },
};

type TabTypes = 'Claim Airdrop' | 'Collator' | 'Governance';

export const ParticipationMechanicsSection = () => {
  const [activeTab, setActiveTab] = useState<TabTypes>('Claim Airdrop');

  return (
    <section className="bg-mono-0 py-20 px-5 md:px-0 lg:flex lg:flex-col lg:items-center">
      <div className="flex flex-col items-center mb-9 md:px-5 lg:px-0">
        <SectionHeader className="text-center pb-2">
          Participation Mechanics
        </SectionHeader>
        <SectionTitle className="pb-4">Join the Tangle Ecosystem</SectionTitle>
        <SectionDescription className="text-center lg:w-[70%]">
          With Tangle Network, we can create a more scalable, interoperable, and
          positive-sum web3 privacy ecosystem.
        </SectionDescription>
      </div>

      <div className="lg:w-[70%]">
        <TabsRoot
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(nextTab) => setActiveTab(nextTab as TabTypes)}
        >

          {/* Desktop + Mobile Tab Triggers */}
          <TabsList aria-label="tabs" className="lg:mx-0">
            <div className="grid md:hidden lg:grid w-full grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {Object.keys(tabsContent).map((tabName, i) => (
                <TabTrigger
                  value={tabName}
                  className="w-full flex flex-col items-center justify-center !bg-inherit p-0"
                  key={i}
                >
                  <ParticipationTabTrigger tabName={tabName} />
                </TabTrigger>
              ))}
            </div>

            {/* Tablet Tab Triggers  */}
            <Swiper
              spaceBetween={16}
              slidesPerView="auto"
              freeMode={true}
              modules={[FreeMode]}
              className="w-full hidden md:block lg:hidden mb-6 !mx-0 !pl-5"
            >
              {Object.keys(tabsContent).map((tabName, i) => (
                <SwiperSlide
                  key={i}
                  style={{
                    width: 225,
                    height: 'auto',
                  }}
                >
                  <TabTrigger
                    value={tabName}
                    className="w-full !bg-inherit p-0"
                    key={i}
                  >
                    <ParticipationTabTrigger tabName={tabName} />
                  </TabTrigger>
                </SwiperSlide>
              ))}
            </Swiper>
          </TabsList>

          {/* Tab Contents */}
          {Object.entries(tabsContent).map(([key, value]) => (
            <TabContent key={key} value={key} className="md:px-5 lg:px-0">
              <Typography
                variant="h5"
                className="font-bold !text-[24px] !leading-[40px] mb-3"
              >
                {value.title}
              </Typography>
              <p className="text-mono-140 text-[20px] leading-[32px] mb-6">
                {value.description}
              </p>
              <a
                href={value.linkUrl}
                className="text-purple-70 underline font-bold capitalize"
              >
                {value.linkText}
              </a>
            </TabContent>
          ))}
        </TabsRoot>
      </div>
    </section>
  );
};

const ParticipationTabTrigger: React.FC<TangleFeatureCardProps> = (props) => {
  const { tabName } = props;
  return (
    <>
      <div className="participation-tab w-full aspect-square flex justify-center items-center rounded-lg">
        <div className="w-full text-inherit">
          <div className="flex flex-col items-center gap-2 text-inherit">
            <div className="w-12 h-12 bg-mono-40 rounded-full" />
            <p className="text-[16px] leading-[25.6px] md:text-[24px] md:leading-[40px] font-bold text-inherit">
              {tabName}
            </p>
          </div>
        </div>
      </div>
      <div className="participation-tab-polygon w-0 h-0 border-transparent border-solid border-x-[8px] border-t-[16px]" />
    </>
  );
};
