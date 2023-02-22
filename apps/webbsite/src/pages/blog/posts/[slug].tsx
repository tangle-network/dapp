import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { NotionRenderer } from 'react-notion-x';
import { Heading2 } from '../../../components';
import { Notion, Post, StaticPropsParams } from '../../../libs/notion';

const Post: FC<{ post: Post }> = ({ post }) => {
  return (
    <NotionRenderer
      bodyClassName="!mt-[68px]"
      fullPage
      disableHeader
      components={{
        Header: Heading2,
        nextImage: Image,
        nextLink: Link,
      }}
      pageCover={<div />}
      recordMap={post.recordMap}
    />
  );
};

export const getStaticPaths = async () => {
  const notion = new Notion();

  const posts = await notion.getPosts();

  if (!posts) return { paths: [], fallback: true };

  return {
    paths: posts.map((post: any) => `/blog/posts/${post.metadata.slug}`),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params as StaticPropsParams;

  if (!slug) throw new Error('Slug is not defined.');

  const notion = new Notion();

  const post = await notion.getPostBySlug(slug);

  if (!post) return { props: { post: {} }, fallback: true };

  return {
    props: {
      post: post ?? {},
    },
    revalidate: 60,
  };
};

export default Post;
