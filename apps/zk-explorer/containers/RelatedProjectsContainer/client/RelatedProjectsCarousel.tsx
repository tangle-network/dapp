'use client';

import type { FC } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

import { ProjectCard } from '../../../components/ProjectCard/ProjectCard';
import type { ProjectItem } from '../../../components/ProjectCard/types';

const RelatedProjectsCarousel: FC<{ projects: ProjectItem[] }> = ({
  projects,
}) => {
  return (
    <Swiper
      slidesPerView={3}
      spaceBetween={20}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Pagination]}
    >
      {projects.map((project, idx) => (
        <SwiperSlide key={idx}>
          <ProjectCard {...project} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default RelatedProjectsCarousel;
