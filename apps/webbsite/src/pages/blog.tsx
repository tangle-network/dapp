import { Typography } from '@webb-tools/webb-ui-components';
import { GetStaticProps } from 'next';
import { FC } from 'react';
import { BlogSection, FeaturedPostSection } from '../components';
import { Notion, Post, Video } from '../libs/notion';

type BlogProps = {
  posts: Post[];
  videos: Video[];
};

const Blog: FC<{ blog: BlogProps }> = ({ blog: { posts, videos } }) => {
  // Featured post is the last one in the array
  const featuredPost =
    posts.length > 0 ? posts[posts.length - 1] : ({} as Post);
  // Recent videos are the last 3 in the array
  const recentVideos = videos.length > 0 ? videos.slice(-3) : ([] as Video[]);

  return (
    <div className="pt-[168px] mx-auto max-w-[1200px] pb-[86px]">
      <Typography variant="mkt-h2" className="text-center mb-[24px]">
        The Webb Blog
      </Typography>
      {Object.keys(featuredPost).length > 0 && recentVideos.length > 0 && (
        <FeaturedPostSection
          featuredPost={featuredPost}
          recentVideos={recentVideos}
        />
      )}
      {posts.length > 0 && <BlogSection type="post" items={posts} />}
      {videos.length > 0 && <BlogSection type="video" items={videos} />}
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
