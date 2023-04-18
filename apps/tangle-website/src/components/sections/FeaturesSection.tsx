import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';

import {
  SectionHeader,
  SectionTitle,
  SectionDescription,
  TangleFeatureCard,
} from '..';
import { TANGLE_OVERVIEW_URL, WANT_TO_LEARN_MORE_URL } from '../../constants';

const tangleFeatures = [
  {
    title: 'Proof-of-Stake Authority Selection',
    description:
      'The Tangle Network utilizes an advanced Proof-of-Stake authority selection system. This enables fully permissionless participation in securing cross chain zero knowledge applications.',
    link: TANGLE_OVERVIEW_URL,
  },
  {
    title: 'Threshold ECDSA Signature',
    description:
      'The Tangle Network uses a multi-stage governance system to sign zero-knowledge payloads with threshold signatures.',
    link: WANT_TO_LEARN_MORE_URL,
  },
  {
    title: 'Hybrid Light/ DKG based Governance',
    description:
      'The Tangle Network employs a light-client validation protocol, ensuring each TSS-signed message is cryptographically verified through trustless on-chain governance.',
    link: WANT_TO_LEARN_MORE_URL,
  },
];

export const FeaturesSection = () => {
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

      {/* Desktop + Mobile */}
      <div className="md:hidden flex lg:flex flex-col items-stretch justify-items-stretch gap-6 lg:flex-row lg:w-[77.5%] px-5 lg:px-0">
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

      {/* Tablet */}
      <Swiper
        spaceBetween={16}
        slidesPerView="auto"
        freeMode={true}
        modules={[FreeMode]}
        className="hidden md:block lg:hidden w-full !pl-5"
      >
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
    </section>
  );
};
