import { FC } from 'react';
import { Heading1, BlogSection, Heading2 } from '../components';
import { Notion, Post } from '../libs/notion';

const Blog: FC<{ posts: Post[] }> = ({ posts }) => {
  return (
    <div className="pt-[168px] mx-auto max-w-[1122px]">
      <Heading2 className="text-center text-mono-200">The Webb Blog</Heading2>
      <BlogSection type="post" items={posts} />
    </div>
  );
};

export const getStaticProps = async () => {
  const notion = new Notion();

  const posts = await notion.getPosts();

  return {
    props: {
      posts,
    },
    revalidate: 60,
  };
};

export default Blog;
