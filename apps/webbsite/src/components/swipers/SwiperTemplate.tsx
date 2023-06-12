import { FC, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Transition } from '@headlessui/react';
import cx from 'classnames';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { Button, Typography } from '@webb-tools/webb-ui-components';

export type SwiperItemType = {
  title: string;
  description: string;
  stepImg: string;
  illustrationImg: string;
};

interface SwiperProps {
  swiperItems: Array<SwiperItemType>;
}

export const SwiperTemplate: FC<SwiperProps> = ({ swiperItems }) => {
  const [ref, _] = useInView();

  // The swiper instance ref
  const swiperRef = useRef<SwiperType>();

  // Refs to the next/prev buttons
  const paginationRef = useRef<null>(null);
  const navigationPrevRef = useRef<HTMLElement>(null);
  const navigationNextRef = useRef<HTMLElement>(null);

  // State to track active index slide
  const [activeIndex, setActiveIndex] = useState(0);

  const illustrationItems = swiperItems.map((item, idx) => (
    <Transition
      className={cx(
        'absolute top-0 left-0 w-full h-full',
        'flex items-start justify-center md:items-center'
      )}
      appear={idx === activeIndex}
      key={idx}
      show={idx === activeIndex}
      enter="transition-opacity duration-[500ms]"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-[500ms]"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="relative w-full">
        <Image
          src={item.illustrationImg}
          alt={item.title}
          width="0"
          height="0"
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
    </Transition>
  ));

  return (
    <div
      ref={ref}
      className={cx(
        'bg-mono-180 rounded-lg mx-auto px-4 py-9 lg:p-12',
        'flex flex-col md:flex-row justify-between gap-6'
      )}
    >
      <div className="md:w-[calc(50%-12px)] space-y-4 bg-mono-180">
        <Swiper
          effect="coverflow"
          grabCursor={false}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          autoplay={false}
          pagination={{
            el: paginationRef.current,
            clickable: true,
            renderBullet: (_, className) =>
              '<span class="' + className + '">' + '</span>',
          }}
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          modules={[EffectCoverflow, Navigation, Pagination]}
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
          {swiperItems.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div className="space-y-4 md:space-y-0">
                <div className="space-y-4">
                  <Typography
                    variant="mkt-subheading"
                    fw="black"
                    className="dark:text-mono-0"
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="mkt-body2"
                    fw="medium"
                    className="dark:text-mono-80"
                  >
                    {item.description}
                  </Typography>

                  <div className="relative">
                    <Image
                      src={item.stepImg}
                      alt={item.title}
                      width="0"
                      height="0"
                      sizes="100vw"
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                <div className="w-full aspect-square relative md:hidden">
                  {illustrationItems}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="flex justify-between items-center">
          {/** Pagination */}
          <div ref={paginationRef} className="flex space-x-2"></div>

          {/** Previous/Next buttons */}
          <div className="flex space-x-2">
            <Button
              variant="utility"
              ref={navigationPrevRef}
              isDisabled={activeIndex === 0}
              className="disabled:!bg-inherit"
            >
              prev
            </Button>
            <Button
              variant="utility"
              ref={navigationNextRef}
              isDisabled={activeIndex === swiperItems.length - 1}
              className="disabled:!bg-inherit"
            >
              next
            </Button>
          </div>
        </div>
      </div>

      <div className="md:w-[calc(50%-12px)] relative hidden grow md:block">
        {illustrationItems}
      </div>
    </div>
  );
};
