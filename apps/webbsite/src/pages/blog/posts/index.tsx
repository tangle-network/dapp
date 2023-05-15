import { Typography } from '@webb-tools/webb-ui-components';
import { GetStaticProps } from 'next';
import { FC } from 'react';
import { BlogSection } from '../../../components';
import { Post, getPosts } from '../../../libs/webb-cms';

const Posts: FC<{ posts: Post[] }> = ({ posts }) => {
  return (
    <div className="pt-[168px] mx-auto max-w-[1200px] pb-[86px]">
      <Typography variant="mkt-h2" className="text-center mb-[24px]">
        All Writings
      </Typography>
      <BlogSection type="post" items={posts} showAllItems />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getPosts();

  return {
    props: {
      posts,
    },
    revalidate: 60,
  };
};

export default Posts;
