import { useState } from 'react';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';

import { SectionDescription, SectionHeader, SectionTitle } from '..';

import {
  CROWDLOAN_URL,
  NODE_OPERATORS_URL,
  POLKADOT_TANGLE_URL,
} from '../../constants';

const tabsContent = {
  Crowdloan: {
    title: 'Participate Tangle’s Crowdloan',
    description:
      'A community-backed launch that allows people to contribute by locking up their KSM temporarily. Tangle’s native token (TNT) will be distributed based on the amount of KSM locked. Join waitlist, and be sure you’re eligible to participate with tokens on hand.',
    linkText: 'Contribute Now',
    linkUrl: CROWDLOAN_URL,
  },
  'Claim Airdrop': {
    title: 'Claim Airdrop',
    description:
      "As part of Tangle's initial launch, the Tangle Network is distributing 5,000,000 TNT tokens to the community. Check eligibility below to see if you qualify for TNT Airdrop!",
    linkText: 'Check Eligibility',
    linkUrl: CROWDLOAN_URL,
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

type TabTypes = 'Crowdloan' | 'Claim Airdrop' | 'Collator' | 'Governance';

export const ParticipationMechanicsSection = () => {
  const [activeTab, setActiveTab] = useState<TabTypes>('Crowdloan');

  return (
    <section className="bg-mono-0 py-20 px-5">
      <div className="flex flex-col items-center mb-9">
        <SectionHeader className="text-center pb-2">
          Participation Mechanics
        </SectionHeader>
        <SectionTitle className="pb-4">Join the Tangle Ecosystem</SectionTitle>
        <SectionDescription className="text-center lg:w-3/5">
          With Tangle Network, we can create a more scalable and interoperable
          web3 privacy ecosystem that is truly a positive-sum game.
        </SectionDescription>
      </div>

      <div>
        <TabsRoot
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(nextTab) => setActiveTab(nextTab as TabTypes)}
        >
          <TabsList aria-label="tabs">
            <div className="w-full grid grid-cols-2 gap-6 mb-6">
              {Object.keys(tabsContent).map((tabName) => (
                <TabTrigger
                  key={tabName}
                  value={tabName}
                  className="text-mono-200 aspect-square radix-state-active:bg-mono-200 radix-state-active:!text-mono-0"
                >
                  <div className="participation-tab flex flex-col items-center gap-2 text-inherit">
                    <div className="w-12 h-12 bg-mono-40 rounded-full" />
                    <p className="text-[16px] leading-[25.6px] md:text-[24px] md:leading-[40px] font-bold text-inherit">
                      {tabName}
                    </p>
                  </div>
                </TabTrigger>
              ))}
            </div>
          </TabsList>

          {Object.entries(tabsContent).map(([key, value]) => (
            <TabContent key={key} value={key}>
              <Typography
                variant="h5"
                className="font-bold !text-[24px] !leading-[40px] mb-3"
              >
                {value.title}
              </Typography>
              <p className="text-mono-140 text-[20px] leading-[32px] mb-6">
                {value.description}
              </p>
              <a href={value.linkUrl} className="">
                {value.linkText}
              </a>
            </TabContent>
          ))}
        </TabsRoot>
      </div>
    </section>
  );
};
