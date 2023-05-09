import { Button, Typography } from '@webb-tools/webb-ui-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';

import { SectionHeader, SectionTitle2 } from '..';
import { UseCase1Svg, UseCase2Svg, UseCase3Svg, UseCase4Svg } from '../svgs';

const tangleUseCases = [
  {
    icon: <UseCase1Svg />,
    title: 'General Messaging Passing & Public Bridges',
    description:
      'General Messaging Passing & Public Bridges: Enables public and transparent cross-chain interactions, ensuring efficiency and security by using a frequently rotating TSS-based system that involves multiple participants working together.',
    link: 'https://docs.webb.tools/docs/anchor-system/overview/',
  },
  {
    icon: <UseCase2Svg />,
    title: 'Connected Shielded Pool Protocols',
    description:
      'The Tangle Network powers the ability to privately move and transfer assets between blockchains.',
    link: 'https://docs.webb.tools/docs/protocols/asset-transfer/overview/',
  },
  {
    icon: <UseCase3Svg />,
    title: 'Connected Shielded Identity Protocols',
    description:
      'The Tangle Network creates identities and connect groups between blockchains.',
    link: 'https://docs.webb.tools/docs/protocols/identity/',
  },
  {
    icon: <UseCase4Svg />,
    title: 'Oracle System and Data Feeds',
    description:
      'The Tangle Network leverages the Webb TSS DKG to sign payloads from data feeds for financial, identity, and other applications.',
    link: 'https://docs.webb.tools/docs/protocols/dkg/overview/',
  },
];

export const UseCasesSection = () => {
  return (
    <section className="bg-mono-200 px-[20px] lg:px-0 py-[80px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-4 lg:px-[11.25%]">
          <SectionHeader className="text-purple-40">Usecases</SectionHeader>
          <SectionTitle2 className="text-left text-mono-0 md:max-w-[604px]">
            Tangle Powers the Community to Optimized for Any Usecases.
          </SectionTitle2>
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
          className="mt-8 hidden md:block lg:hidden"
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
