'use client';

import { type FC, ComponentProps, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

import { ProjectCard } from '../../../components/ProjectCard/ProjectCard';
import type { ProjectItem } from '../../../components/ProjectCard/types';

const RelatedProjectsCarousel: FC<{ projects: ProjectItem[] }> = ({
  projects,
}) => {
  const sharedSwiperProps = useMemo(
    () =>
      ({
        spaceBetween: 20,
        pagination: {
          clickable: true,
        },
        navigation: true,
        modules: [Pagination],
      } satisfies ComponentProps<typeof Swiper>),
    []
  );

  const projectsCmp = useMemo(() => {
    return projects.map((project, idx) => (
      <SwiperSlide key={idx}>
        <ProjectCard {...project} />
      </SwiperSlide>
    ));
  }, [projects]);

  return (
    <>
      <Swiper
        slidesPerView={3}
        {...sharedSwiperProps}
        className="!hidden lg:!block"
      >
        {projectsCmp}
      </Swiper>

      <Swiper
        slidesPerView={2}
        {...sharedSwiperProps}
        className="!hidden md:!block lg:!hidden"
      >
        {projectsCmp}
      </Swiper>

      <Swiper slidesPerView={1} {...sharedSwiperProps} className="md:!hidden">
        {projectsCmp}
      </Swiper>
    </>
  );
};

export default RelatedProjectsCarousel;
