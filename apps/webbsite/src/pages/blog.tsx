import { FC } from 'react';
import { BlogSection, Heading2 } from '../components';
import { Notion, Post } from '../libs/notion';

type BlogProps = {
  posts: Post[];
  videos: Post[];
};

const Blog: FC<{ blog: BlogProps }> = ({ blog }) => {
  const { posts, videos } = blog;

  return (
    <div className="pt-[168px] mx-auto max-w-[1200px] pb-[86px]">
      <Heading2 className="text-center text-mono-200 mb-24">
        The Webb Blog
      </Heading2>
      <BlogSection type="post" items={posts} />
      <BlogSection type="video" items={videos} />
    </div>
  );
};

export const getStaticProps = async () => {
  const notion = new Notion();

  const posts = await notion.getPosts();
  const videos = await notion.getVideos();

  return {
    props: {
      blog: {
        posts,
        videos,
      },
    },
    revalidate: 60,
  };
};

export default Blog;
