import Image from 'next/image';
import { Button, Typography } from '@webb-tools/webb-ui-components';

import { SectionDescription, SectionHeader, SectionTitle } from '..';
import { WhatIsTssSvg, HowTssWorksSvg } from '../svgs';
import { WHAT_IS_TSS_URL, HOW_TSS_WORKS_URL } from '../../constants';

const governanceSystemQnAItems = [
  {
    icon: <WhatIsTssSvg />,
    title: 'What is TSS?',
    description:
      'Threshold signature scheme (TSS) is a form of digital signature in which a group of participants each contribute a partial signature, and the combination of these signatures results in a valid signature.',
    href: WHAT_IS_TSS_URL,
  },
  {
    icon: <HowTssWorksSvg />,
    title: 'How it works',
    description:
      'Relayers propose payloads to the governance system by providing merkle trie proofs of inclusion of state and events agains their respective blockchains. Payloads are verified on-chain and added to an unsigned proposal queue for the Tangle Network DKG Authorities to read.',
    href: HOW_TSS_WORKS_URL,
  },
];

export const GovernanceSystemSection = () => {
  return (
    <section className="dark bg-mono-200">
      <div className="ml-auto mr-0 lg:w-[88.75%] flex flex-col lg:flex-row-reverse lg:gap-6 pt-[40px] pb-[80px] lg:py-[96px]">
        <div className="lg:flex-1 flex items-center">
          <div className="relative w-[340px] md:w-[600px] lg:w=[708px] h-[367px] md:h-[647.65px] lg:h-[762.75px] ml-auto mr-0">
            <Image
              src="/static/assets/governance-system.png"
              alt="Governance System"
              fill
            />
          </div>
        </div>

        <div className="lg:flex-1 px-5 lg:px-0">
          <SectionHeader>Governance System</SectionHeader>
          <SectionTitle className="text-left mt-2 md:w-[70%] lg:w-full">
            The next-gen TSS based blockchain with powerful threshold signature
            governance system
          </SectionTitle>
          <div className="flex gap-4 mt-6">
            <Button variant="secondary" className="button-base-2">
              Read Docs
            </Button>
            <Button className="button-base-2">View Network</Button>
          </div>
          <div className="mt-[56px] flex flex-col gap-6">
            {governanceSystemQnAItems.map(
              ({ icon, title, description, href }, index) => (
                <div key={index}>
                  {icon}
                  <Typography
                    variant="h4"
                    className="font-bold text-mono-0 mt-6 mb-4"
                  >
                    {title}
                  </Typography>
                  <SectionDescription className="!md:text-[20px] !md:leading-[32px] mb-6">
                    {description}
                  </SectionDescription>
                  <a className="text-tangle_dark_purple" href={href}>
                    Learn more →
                  </a>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
