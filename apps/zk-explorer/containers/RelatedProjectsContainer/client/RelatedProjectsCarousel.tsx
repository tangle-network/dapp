'use client';

import { type FC, ComponentProps, useMemo } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

import { ProjectCard } from '../../../components/ProjectCard/ProjectCard';
import type { ProjectItem } from '../../../components/ProjectCard/types';
import { createProjectDetailPath } from '../../../utils';

const sharedSwiperProps = {
  spaceBetween: 20,
  pagination: {
    clickable: true,
  },
  navigation: true,
  modules: [Pagination],
} satisfies ComponentProps<typeof Swiper>;

const RelatedProjectsCarousel: FC<{ projects: ProjectItem[] }> = ({
  projects,
}) => {
  const projectsCmp = useMemo(() => {
    return projects.map((project, idx) => (
      <SwiperSlide key={idx}>
        <Link
          href={createProjectDetailPath(
            project.repositoryOwner,
            project.repositoryName
          )}
        >
          <ProjectCard {...project} />
        </Link>
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
