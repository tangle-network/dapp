import Image from 'next/image';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { DKG_STATS_URL } from '@webb-tools/webb-ui-components/constants';

import { WhatIsTssSvg, HowTssWorksSvg } from '../svgs';
import { LinkButton } from '..';
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
      "Relayers suggest changes to the network via the governance system by providing proof that the updates are based on accurate information from their corresponding blockchains. These updates are verified and placed in a queue, waiting for Tangle Network's private and decentralized authorities to review and approve them.",
    href: HOW_TSS_WORKS_URL,
  },
];

export const GovernanceSystemSection = () => {
  return (
    <section className="dark bg-mono-200">
      <div className="max-w-[1440px] mx-auto">
        <div
          className={cx(
            'ml-auto mr-0 lg:w-[88.75%] pt-[40px] pb-[80px] lg:py-[60px]',
            'flex flex-col lg:flex-row-reverse lg:gap-6'
          )}
        >
          <div className="flex items-center lg:flex-1">
            <div
              className={cx(
                'relative ml-auto mr-0',
                'w-4/5 lg:w-full aspect-[463/500]'
              )}
            >
              <Image
                src="/static/assets/governance-system.png"
                alt="Governance System"
                fill
              />
            </div>
          </div>

          <div className="px-5 lg:flex-1 lg:px-0">
            <Typography
              variant="mkt-small-caps"
              className="font-black dark:text-purple-50"
            >
              Governance System
            </Typography>
            <Typography
              variant="mkt-h4"
              className="text-left mt-2 md:w-[70%] lg:w-full font-black dark:text-mono-0"
            >
              The next-gen TSS based blockchain with powerful threshold
              signature governance system
            </Typography>
            <div className="flex gap-4 mt-6">
              <LinkButton
                href={WHAT_IS_TSS_URL}
                variant="secondary"
                className="px-5 md:px-9"
              >
                Read Docs
              </LinkButton>
              <LinkButton href={DKG_STATS_URL} className="px-5 md:px-9">
                View Network
              </LinkButton>
            </div>
            <div className="mt-[56px] flex flex-col gap-6">
              {governanceSystemQnAItems.map(
                ({ icon, title, description, href }, index) => (
                  <div key={index}>
                    {icon}
                    <Typography
                      variant="mkt-subheading"
                      className="mt-6 mb-4 font-bold dark:text-mono-0"
                    >
                      {title}
                    </Typography>
                    <Typography
                      variant="mkt-body1"
                      className="mb-6 font-medium dark:text-mono-80"
                    >
                      {description}
                    </Typography>
                    <a className="text-tangle_dark_purple" href={href}>
                      Learn more →
                    </a>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
