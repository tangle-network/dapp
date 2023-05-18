import { Typography } from '@webb-tools/webb-ui-components';
import { GetStaticProps } from 'next';
import { FC } from 'react';
import { BlogSection, FeaturedPostSection } from '../components';
import { Post, getPosts, Video, getVideos } from '../libs/webb-cms';

type BlogProps = {
  posts: Post[];
  videos: Video[];
};

const Blog: FC<{ blog: BlogProps }> = ({ blog: { posts, videos } }) => {
  const featuredPost =
    posts.length > 0 ? posts[posts.length - 1] : ({} as Post);

  const recentVideos = videos.length > 0 ? videos.slice(-3) : ([] as Video[]);

  return (
    <div className="pt-[168px] mx-auto max-w-[1200px] pb-[86px]">
      <Typography variant="mkt-h3" className="text-center mb-[24px] font-black text-mono-200">
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
  const posts = await getPosts();

  const videos = await getVideos();

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
