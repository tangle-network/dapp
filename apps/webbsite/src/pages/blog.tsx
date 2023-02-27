import { GetStaticProps } from 'next';
import { FC } from 'react';
import { BlogSection, FeaturedPostSection, Heading2 } from '../components';
import { Notion, Post, Video } from '../libs/notion';

type BlogProps = {
  posts: Post[];
  videos: Video[];
};

const Blog: FC<{ blog: BlogProps }> = ({ blog: { posts, videos } }) => {
  // Featured post is the last one in the array
  const featuredPost = posts[posts.length - 1];
  // Recent videos are the last 3 in the array
  const recentVideos = videos.slice(-3);

  return (
    <div className="pt-[168px] mx-auto max-w-[1200px] pb-[86px]">
      <Heading2 className="text-center text-mono-200 mb-[24px]">
        The Webb Blog
      </Heading2>
      <FeaturedPostSection
        featuredPost={featuredPost}
        recentVideos={recentVideos}
      />
      <BlogSection type="post" items={posts} />
      <BlogSection type="video" items={videos} />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
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
