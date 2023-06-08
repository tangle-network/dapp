import { useState } from 'react';
import Image from 'next/image';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { WEBB_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';

import { NODE_OPERATORS_URL, POLKADOT_TANGLE_URL } from '../../constants';

interface TabTriggerProps {
  tabName: string;
  img: string;
}

const tabsContent = {
  Validator: {
    title: 'Become a Validator',
    description:
      'Running a Validator node on the Tangle Network allows you to connect to the network, sync with a bootnode, obtain local access to RPC endpoints, and author blocks. The network rewards validators by paying a set amount of TNT tokens as rewards.',
    linkText: 'Learn More',
    linkUrl: WEBB_DOCS_URL,
    img: '/static/assets/validator.png',
  },
  Relayer: {
    title: 'Run a Relayer',
    description:
      "By participating as a Relayer, you'll play a crucial role in maintaining the efficiency and security of our system while earning commissions on each relayed Private Transaction.",
    linkText: 'Learn More',
    linkUrl: NODE_OPERATORS_URL,
    img: '/static/assets/relayer.png',
  },
  Governance: {
    title: 'Participate in Governance',
    description:
      "Through Tangle's on-chain governance system, you can create proposals for updating cross-chain applications. Tangle token holders can propose changes to the Tangle network.",
    linkText: 'Participate Now',
    linkUrl: POLKADOT_TANGLE_URL,
    img: '/static/assets/governance.png',
  },
  Develop: {
    title: 'Develop Applications & Research',
    description:
      'Become a part of the Tangle community by developing cutting-edge applications and conducting pioneering research. Together, we can create a more scalable, interoperable, and privacy-focused web3 ecosystem.',
    linkText: 'Get Started',
    linkUrl: POLKADOT_TANGLE_URL,
    img: '/static/assets/develop.png',
  },
};

type TabTypes = 'Validator' | 'Relayer' | 'Governance' | 'Develop';

export const ParticipationMechanicsSection = () => {
  const [activeTab, setActiveTab] = useState<TabTypes>('Validator');

  return (
    <section className="bg-mono-0 py-[60px] px-5 md:px-0 lg:flex lg:flex-col lg:items-center">
      <div className="max-w-[900px] mx-auto">
        <div className="flex flex-col items-center mb-9 md:px-5 lg:px-0">
          <Typography
            variant="mkt-small-caps"
            className="pb-2 font-black text-center text-purple-70"
          >
            Participation Mechanics
          </Typography>
          <Typography
            variant="mkt-h3"
            className="pb-4 font-black text-mono-200"
          >
            Join the Tangle Ecosystem
          </Typography>
          <Typography
            variant="mkt-body1"
            className="font-medium text-center text-mono-140"
          >
            With Tangle Network, we can create a more scalable, interoperable,
            and positive-sum web3 privacy ecosystem.
          </Typography>
        </div>

        <TabsRoot
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(nextTab) => setActiveTab(nextTab as TabTypes)}
        >
          {/* Desktop + Mobile Tab Triggers */}
          <TabsList aria-label="tabs" className="lg:mx-0">
            <div className="grid w-full grid-cols-2 gap-3 mb-6 md:hidden lg:grid lg:grid-cols-4">
              {Object.keys(tabsContent).map((tabName, i) => (
                <TabTrigger
                  value={tabName}
                  className="w-full !bg-inherit p-0"
                  key={i}
                >
                  <ParticipationTabTrigger
                    tabName={tabName}
                    img={tabsContent[tabName].img}
                  />
                </TabTrigger>
              ))}
            </div>

            {/* Tablet Tab Triggers  */}
            <Swiper
              spaceBetween={16}
              slidesPerView="auto"
              freeMode={true}
              modules={[FreeMode]}
              className="w-full !hidden md:!block lg:!hidden mb-6 !mx-0 !pl-5"
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
                    <ParticipationTabTrigger
                      tabName={tabName}
                      img={tabsContent[tabName].img}
                    />
                  </TabTrigger>
                </SwiperSlide>
              ))}
            </Swiper>
          </TabsList>

          {/* Tab Contents */}
          {Object.entries(tabsContent).map(([key, value]) => (
            <TabContent key={key} value={key} className="md:px-5 lg:px-0">
              <Typography
                variant="mkt-subheading"
                className="mb-3 font-bold text-mono-200"
              >
                {value.title}
              </Typography>
              <Typography
                variant="mkt-body1"
                className="mb-6 font-medium text-mono-140"
              >
                {value.description}
              </Typography>
              <a
                href={value.linkUrl}
                className="font-bold capitalize text-purple-70"
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

const ParticipationTabTrigger: React.FC<TabTriggerProps> = ({
  tabName,
  img,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center justify-center w-full rounded-lg participation-tab aspect-square">
        <div className="w-full text-inherit">
          <div className="flex flex-col items-center gap-2 text-inherit">
            <Image
              src={img}
              alt={tabName}
              width={48}
              height={48}
              className="participation-tab-img rounded-full bg-mono-40"
            />
            <p className="text-[16px] leading-[25.6px] md:text-[24px] md:leading-[40px] font-bold text-inherit">
              {tabName}
            </p>
          </div>
        </div>
      </div>
      <div className="participation-tab-polygon w-0 h-0 border-transparent border-solid border-x-[8px] border-t-[16px]" />
    </div>
  );
};
