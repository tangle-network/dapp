import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { SectionHeader, SectionTitle2 } from '..';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { UseCase1Svg, UseCase2Svg, UseCase3Svg, UseCase4Svg } from '../svgs';

const tangleUsecases = [
  {
    icon: <UseCase1Svg />,
    title: 'General Messaging Passing & Public Bridges',
    description:
      'Capable of enabling public/plaintext cross-chain use cases. Providing efficiency, and security through the use of a TSS MPC that rotates frequently.',
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
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width <= 768) {
        setIsTablet(true);
      } else {
        setIsTablet(false);
      }
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="bg-mono-200 px-[20px] py-[80px] xl:flex xl:items-center xl:justify-center">
      <div>
        <div className="flex flex-col gap-4">
          <SectionHeader className="text-purple-40">Usecases</SectionHeader>
          <SectionTitle2 className="text-left text-mono-0 md:max-w-[604px]">
            Tangle Powers the Community to Optimized for Any Usecases.
          </SectionTitle2>
        </div>
        {isTablet ? (
          <div className="mt-8 flex flex-col gap-6">
            {tangleUsecases.map((usecase, i) => {
              return (
                <UseCaseCard
                  icon={usecase.icon}
                  title={usecase.title}
                  description={usecase.description}
                  link={usecase.link}
                  key={i}
                />
              );
            })}
          </div>
        ) : (
          <Swiper spaceBetween={16} slidesPerView="auto" className="mt-8">
            {tangleUsecases.map((usecase, i) => {
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
                    icon={usecase.icon}
                    title={usecase.title}
                    description={usecase.description}
                    link={usecase.link}
                    key={i}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
};

const UseCaseCard = ({ icon, title, description, link }) => {
  return (
    <div className="flex flex-col items-start justify-start gap-10 bg-[#282633] rounded-xl py-[56px] px-[24px] md:w-[264px] md:h-[600px]">
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
