import { Button, Typography } from '@webb-tools/webb-ui-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';

import { SectionHeader } from '..';
import { UseCase1Svg, UseCase2Svg, UseCase3Svg, UseCase4Svg } from '../svgs';

const tangleUseCases = [
  {
    icon: <UseCase1Svg />,
    title: 'General Messaging Passing & Public Bridges',
    description:
      'Seamlessly facilitate public and transparent cross-chain interactions. Experience unparalleled efficiency and security through a dynamic TSS-based system, where multiple participants collaborate harmoniously.',
    link: 'https://docs.webb.tools/docs/anchor-system/overview/',
  },
  {
    icon: <UseCase2Svg />,
    title: 'Connected Shielded Pool Protocols',
    description:
      'Unleash the true potential of interconnected ecosystems to empower private movement and the seamless transfer of assets between blockchains. Unleash the true potential of interconnected ecosystems.',
    link: 'https://docs.webb.tools/docs/protocols/asset-transfer/overview/',
  },
  {
    icon: <UseCase3Svg />,
    title: 'Connected Shielded Identity Protocols',
    description:
      'Harness the revolutionary privacy of the Network to forge identities and establish meaningful connections between diverse blockchains. Bridge the gaps and unite digital realms like never before.',
    link: 'https://docs.webb.tools/docs/protocols/identity/',
  },
  {
    icon: <UseCase4Svg />,
    title: 'Oracle System and Data Feeds',
    description:
      'Empower financial, identity, and other applications with trustworthy information through the next-gen Webb DKG (Distributed Key Generation) to securely sign payloads from data feeds.',
    link: 'https://docs.webb.tools/docs/protocols/dkg/overview/',
  },
];

export const UseCasesSection = () => {
  return (
    <section className="bg-mono-200 px-[20px] lg:px-0 py-[80px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-4 lg:px-[11.25%]">
          <SectionHeader className="text-purple-40">Usecases</SectionHeader>
        </div>

        {/* Desktop + Mobile */}
        <div className="lg:px-[11.25%] mt-8 flex flex-col items-stretch justify-items-stretch md:hidden lg:flex lg:flex-row gap-6">
          {tangleUseCases.map((useCase, i) => {
            return (
              <UseCaseCard
                icon={useCase.icon}
                title={useCase.title}
                description={useCase.description}
                link={useCase.link}
                key={i}
              />
            );
          })}
        </div>

        {/* Tablet */}
        <Swiper
          spaceBetween={16}
          slidesPerView="auto"
          freeMode={true}
          modules={[FreeMode]}
          className="mt-8 !hidden md:!block lg:!hidden"
        >
          {tangleUseCases.map((useCase, i) => {
            return (
              <SwiperSlide
                key={i}
                style={{
                  width: '264px',
                  height: 'auto',
                  alignSelf: 'stretch',
                }}
              >
                <UseCaseCard
                  icon={useCase.icon}
                  title={useCase.title}
                  description={useCase.description}
                  link={useCase.link}
                  key={i}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

const UseCaseCard = ({ icon, title, description, link }) => {
  return (
    <div className="min-h-[600px] md:min-h-min md:h-full lg:h-auto flex-[1] flex flex-col items-start justify-start gap-10 bg-[rgba(255,255,255,0.04)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] rounded-xl py-[56px] px-[24px]">
      {icon}
      <div className="flex flex-col gap-4">
        <Typography variant="h4" className="font-bold text-mono-0">
          {title}
        </Typography>
        <Typography variant="body1" className="!text-mono-80 !leading-7">
          {description}
        </Typography>
      </div>
      <Button
        className="!text-mono-0 bg-[#282633] border-mono-0 mt-auto"
        href={link}
      >
        Learn More
      </Button>
    </div>
  );
};
