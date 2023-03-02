import { GetStaticProps } from 'next';
import { FC } from 'react';
import { BlogSection, Heading2 } from '../../../components';
import { Notion, Post } from '../../../libs/notion';

const Posts: FC<{ posts: Post[] }> = ({ posts }) => {
  return (
    <div className="pt-[168px] mx-auto max-w-[1200px] pb-[86px]">
      <Heading2 className="text-center mb-[24px]">All Blog Posts</Heading2>
      <BlogSection type="post" items={posts} showAllItems />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const notion = new Notion();

  const posts = await notion.getPosts();

  return {
    props: {
      posts,
    },
    revalidate: 60,
  };
};

export default Posts;
