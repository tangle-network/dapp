import { Typography } from '@webb-tools/webb-ui-components';
import { GetStaticProps } from 'next';
import { FC } from 'react';
import { BlogSection } from '../../components';
import { Video, getVideos } from '../../libs/webb-cms';

const Videos: FC<{ videos: Video[] }> = ({ videos }) => {
  return (
    <div className="pt-[168px] mx-auto max-w-[1200px] pb-[86px]">
      <Typography variant="mkt-h2" className="text-center mb-[24px]">
        All Media & Press
      </Typography>
      <BlogSection type="video" items={videos} showAllItems />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const videos = await getVideos();

  return {
    props: {
      videos,
    },
    revalidate: 60,
  };
};

export default Videos;
