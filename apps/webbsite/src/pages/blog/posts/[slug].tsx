import { GetServerSideProps } from 'next';
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as StaticPropsParams;

  if (!slug) throw new Error('Slug is not defined.');

  const notion = new Notion();

  const post = await notion.getPostBySlug(slug);

  return {
    props: {
      post: post ?? {},
    },
  };
};

export default Post;
