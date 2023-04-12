import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import {
  SectionHeader,
  SectionTitle,
  SectionDescription,
  TangleFeatureCard,
} from '..';

const tangleFeatures = [
  {
    title: 'Proof-of-Stake Authority Selection',
    description:
      'The Tangle Network utilizes an advanced Proof-of-Stake authority selection system. This enables fully permissionless participation in securing cross chain zero knowledge applications.',
    link: '#',
  },
  {
    title: 'Threshold ECDSA Signature',
    description:
      'The Tangle Network uses a multi-stage governance system to sign zero-knowledge payloads with threshold signatures.',
    link: '#',
  },
  {
    title: 'Hybrid Light/ DKG based Governance',
    description:
      'The Tangle Network employs a light-client validation protocol, ensuring each TSS-signed message is cryptographically verified through trustless on-chain governance.',
    link: '#',
  },
];

export const FeaturesSection = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width <= 428 || width >= 1024) {
        setIsTablet(false);
      } else {
        setIsTablet(true);
      }
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="flex flex-col items-center gap-[60px] py-[94px]">
      <div className="flex flex-col items-center gap-4 px-5">
        <div className="flex flex-col items-center gap-2">
          <SectionHeader>Features</SectionHeader>
          <SectionTitle>What makes Tangle Unique?</SectionTitle>
        </div>
        <SectionDescription className="text-center lg:w-[65%]">
          The Tangle network doubles as hub for routing cross chain messages and
          for anchoring itself as a bridge endpoint for cross chain
          zero-knowledge applications.
        </SectionDescription>
      </div>
      {!isTablet ? (
        <div className="flex flex-col items-stretch justify-items-stretch gap-6 lg:flex-row lg:w-[77.5%] px-5 lg:px-0">
          {tangleFeatures.map((feat, i) => {
            return (
              <TangleFeatureCard
                img={`/static/assets/tangle-features-${i + 1}.png`}
                index={i + 1}
                title={feat.title}
                description={feat.description}
                link={feat.link}
                key={i}
              />
            );
          })}
        </div>
      ) : (
        <Swiper spaceBetween={16} slidesPerView="auto" className="w-full !pl-5">
          {tangleFeatures.map((feat, i) => {
            return (
              <SwiperSlide
                key={i}
                style={{ width: 'auto', height: 'auto', alignSelf: 'stretch' }}
              >
                <TangleFeatureCard
                  img={`/static/assets/tangle-features-${i + 1}.png`}
                  index={i + 1}
                  title={feat.title}
                  description={feat.description}
                  link={feat.link}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </section>
  );
};
