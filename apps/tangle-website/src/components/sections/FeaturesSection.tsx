import { FC } from 'react';
import Image from 'next/image';
import { Typography } from '@webb-tools/webb-ui-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import { LinkButton } from '..';
import { TANGLE_OVERVIEW_URL, WANT_TO_LEARN_MORE_URL } from '../../constants';

interface TangleFeatureCardProps {
  img: string;
  index: number;
  title: string;
  description: string;
  link: string;
}

const tangleFeatures = [
  {
    title: 'Proof-of-Stake Authority Selection',
    description:
      'The Tangle Network uses a cutting-edge selection system based on Proof-of-Stake, allowing anyone to participate in securing private cross-chain applications.',
    link: TANGLE_OVERVIEW_URL,
  },
  {
    title: 'Multi-Stage Governance for Signing',
    description:
      "Tangle Network's governance system signs private data using a collaborative approach, ensuring both privacy and security.",
    link: WANT_TO_LEARN_MORE_URL,
  },
  {
    title: 'Efficient and Trustless Validation',
    description:
      'The Tangle Network relies on a lightweight validation protocol that guarantees every message is securely verified without the need for trust between participants.',
    link: WANT_TO_LEARN_MORE_URL,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-[60px]">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4 px-5">
          <div className="flex flex-col items-center gap-2">
            <Typography
              variant="mkt-small-caps"
              className="font-black text-purple-70"
            >
              Features
            </Typography>
            <Typography variant="mkt-h3" className="font-black text-mono-200">
              What makes Tangle Unique?
            </Typography>
          </div>
          <Typography
            variant="mkt-body1"
            className="text-center lg:w-[65%] font-medium text-mono-140"
          >
            The Tangle network serves as a hub for secure communication and
            private interactions across different blockchains.
          </Typography>
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
          className="!hidden md:!block lg:!hidden w-full !pl-5"
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
      </div>
    </section>
  );
};

const TangleFeatureCard: FC<TangleFeatureCardProps> = (props) => {
  const { img, index, title, description, link } = props;
  return (
    <div className="bg-mono-0 hover:shadow-[0_8px_20px_rgba(18,17,39,0.08)] rounded-lg overflow-hidden flex flex-col md:w-[300px] min-h-[647px] md:min-h-min md:h-full lg:h-auto flex-1">
      <div className="relative aspect-[12/5] w-full object-contain">
        <Image src={img} alt={title} fill />
      </div>
      <div className="py-[42px] px-6 flex flex-col justify-between flex-1">
        <div>
          <p className="mono1 mb-4">0{index}</p>
          <hr />
          <Typography
            variant="mkt-subheading"
            className="mt-4 mb-6 font-black text-mono-200"
          >
            {title}
          </Typography>
          <Typography variant="mkt-body1" className="text-mono-140 font-medium">
            {description}
          </Typography>
        </div>
        <LinkButton href={link} className="mt-4">
          Learn More
        </LinkButton>
      </div>
    </div>
  );
};
