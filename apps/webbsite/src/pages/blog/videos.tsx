import { GetStaticProps } from 'next';
import { FC } from 'react';
import { BlogSection, Heading2 } from '../../components';
import { Notion, Video } from '../../libs/notion';

const Videos: FC<{ videos: Video[] }> = ({ videos }) => {
  return (
    <div className="pt-[168px] mx-auto max-w-[1200px] pb-[86px]">
      <Heading2 className="text-center text-mono-200 mb-[24px]">
        All Videos
      </Heading2>
      <BlogSection type="video" items={videos} showAllItems />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const notion = new Notion();

  const videos = await notion.getVideos();

  return {
    props: {
      videos,
    },
    revalidate: 60,
  };
};

export default Videos;
