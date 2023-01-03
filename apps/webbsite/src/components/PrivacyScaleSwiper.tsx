import cx from 'classnames';
import Heading4 from './Heading4';
import SubHeading2 from './SubHeading2';

import { Button } from '@webb-tools/webb-ui-components/components/Button/Button';

import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import { useEffect, useRef, useState } from 'react';
import PrivacyScaleIllustration from './PrivacyScaleIllustration';
import { useInView } from 'react-intersection-observer';

const swipersContent: Array<{ title: string; description: string }> = [
  {
    title: 'Independent privacy sets are not scalable.',
    description:
      'Traditional zero-knowledge applications have a single global privacy set that can only be interacted with from a single place.',
  },
  {
    title: 'Aggregating privacy sets scales privacy.',
    description:
      'Aggregating privacy sets allows us to scale privacy to the sum of each private sets size and grow access from many locations.',
  },
  {
    title: 'Connecting privacy sets requires distributed coordination.',
    description:
      'Each tree maintains a view of the roots of the other trees to achieve connection.',
  },
  {
    title: 'Together, we power cross-chain zero-knowledge messaging.',
    description:
      'In a connected system, users can insert zero-knowledge messages from any endpoint.',
  },
  {
    title: 'Attest to messages in zero-knowledge after updates propagate.',
    description:
      'Views are updated, recording the messages which have been added to endpoints. ',
  },
  {
    title: 'Prove zero-knowledge messages exist from any connected anchor.',
    description:
      'Users prove messages exist in any privacy set from any location in a way that benefits all participants.',
  },
];

const PrivacyScaleSwiper = () => {
  const [ref, inView] = useInView();

  // The swiper instance ref
  const swiperRef = useRef<SwiperType>();

  // Refs to the next/prev buttons
  const navigationPrevRef = useRef<HTMLElement>(null);
  const navigationNextRef = useRef<HTMLElement>(null);

  // State to track active index slide
  const [activeIndex, setActiveIndex] = useState(0);

  // When the component is in view, start the autoplay
  // When the component is not in view, stop the autoplay
  useEffect(() => {
    if (inView) {
      swiperRef.current?.autoplay.start();
    } else {
      swiperRef.current?.autoplay.stop();
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className={cx(
        'flex justify-between w-full sm:max-w-[450px] md:max-w-[1000px] h-[930px] md:h-[483px]',
        'bg-mono-180 rounded-lg mx-auto',
        'lg:p-6 space-x-7 lg:space-x-16',
        'md:pr-4'
      )}
    >
      <div className="w-full sm:max-w-[450px]">
        <Swiper
          className="h-full"
          effect={'coverflow'}
          grabCursor={false}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          autoplay={{
            delay: 4600,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          modules={[Autoplay, EffectCoverflow, Navigation, Pagination]}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            swiper.params.navigation.prevEl = navigationPrevRef.current;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            swiper.params.navigation.nextEl = navigationNextRef.current;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
        >
          {swipersContent.map((content, index) => (
            <SwiperSlide key={index}>
              <div className="p-6 space-y-9">
                <div className="space-y-4 h-[315px]">
                  <Heading4 className="text-mono-0">{content.title}</Heading4>

                  <SubHeading2 className="text-mono-80">
                    {content.description}
                  </SubHeading2>

                  <div className="max-w-[402px] min-h-[66px] w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/static/svgs/privacy-set-step-${index + 1}.svg`}
                      alt={`privacy-scale-${index + 1}`}
                    />
                  </div>
                </div>

                <div className="relative h-[435px] md:hidden">
                  <PrivacyScaleIllustration activeIndex={activeIndex} />
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/** Previous/Next buttons */}
          <div className="absolute z-10 flex space-x-2 bottom-6 right-6">
            <Button ref={navigationPrevRef} variant="utility">
              prev
            </Button>
            <Button ref={navigationNextRef} variant="utility">
              next
            </Button>
          </div>
        </Swiper>
      </div>

      <div className="relative hidden grow md:block">
        <PrivacyScaleIllustration activeIndex={activeIndex} />
      </div>
    </div>
  );
};

export default PrivacyScaleSwiper;
